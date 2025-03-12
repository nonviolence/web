import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// 检查环境变量是否存在
if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('缺少必要的环境变量: DEEPSEEK_API_KEY');
}

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  timeout: 50000, // 设置50秒超时
  maxRetries: 3, // 最多重试3次
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45秒后终止

    try {
      const response = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        stream: false,
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (!response.choices[0]?.message?.content) {
        throw new Error('API 返回了无效的响应格式');
      }

      return NextResponse.json({ 
        content: response.choices[0].message.content 
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // 区分不同类型的错误
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: '请求超时，请稍后重试' },
          { status: 504 }
        );
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API 认证失败' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: '对话生成失败，请稍后重试。' },
      { status: 500 }
    );
  }
} 