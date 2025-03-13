import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// 检查环境变量是否存在
if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('缺少必要的环境变量: DEEPSEEK_API_KEY');
}

// 创建重试函数
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> {
  let lastError: Error | unknown = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`尝试 ${i + 1}/${maxRetries} 失败:`, error);
      
      // 如果不是最后一次重试，则等待后继续
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  timeout: 30000, // 降低单次请求超时时间为30秒
  maxRetries: 2, // 降低OpenAI客户端的重试次数
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '无效的请求格式' },
        { status: 400 }
      );
    }

    // 使用重试机制包装API调用
    const response = await retryOperation(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25秒后终止

        try {
          const result = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: false,
          }, {
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          return result;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      3, // 最多重试3次
      2000 // 初始延迟2秒
    );

    if (!response.choices[0]?.message?.content) {
      throw new Error('API 返回了无效的响应格式');
    }

    return NextResponse.json({ 
      content: response.choices[0].message.content 
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    
    // 区分不同类型的错误
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: '请求超时，正在重试...' },
          { status: 504 }
        );
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API 认证失败' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: '请求过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: '对话生成失败，请稍后重试' },
      { status: 500 }
    );
  }
} 