/**
 * Vision API 示例
 * 演示图像理解功能
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

/**
 * 分析网络图片
 */
async function analyzeImageFromUrl() {
  console.log('🖼️  分析网络图片\n');

  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg';

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请详细描述这张图片的内容，包括：场景、物体、颜色、氛围等。',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // low | high | auto
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    console.log('🤖 AI 分析结果:\n');
    console.log(response.choices[0].message.content);
    console.log('\n📊 Token 使用:', response.usage?.total_tokens);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

/**
 * 分析本地图片（Base64 编码）
 */
async function analyzeLocalImage() {
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📁 分析本地图片\n');

  // 注意：这里需要替换为实际的图片路径
  const imagePath = path.join(process.cwd(), 'example-image.jpg');

  if (!fs.existsSync(imagePath)) {
    console.log('⚠️  示例图片不存在，跳过此演示');
    console.log(`   请在项目根目录放置 example-image.jpg 文件`);
    return;
  }

  try {
    // 读取图片并转为 base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // 根据实际图片类型调整

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '这张图片里有什么？',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    console.log('🤖 AI 回复:\n');
    console.log(response.choices[0].message.content);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

/**
 * 多图片对比分析
 */
async function compareImages() {
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🔄 多图片对比分析\n');

  const images = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/681px-Placeholder_view_vector.svg.png',
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请对比这两张图片的异同点。',
            },
            {
              type: 'image_url',
              image_url: { url: images[0] },
            },
            {
              type: 'image_url',
              image_url: { url: images[1] },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    console.log('🤖 对比结果:\n');
    console.log(response.choices[0].message.content);
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

/**
 * 图片问答
 */
async function imageQA() {
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('❓ 图片问答\n');

  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg';

  const questions = [
    '这张图片是在什么时间拍摄的？',
    '图片中的天气如何？',
    '这个地方适合什么活动？',
  ];

  try {
    for (const question of questions) {
      console.log(`\n💬 问题: ${question}`);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: question },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 200,
      });

      console.log(`🤖 回答: ${response.choices[0].message.content}`);
    }
  } catch (error: any) {
    console.error('❌ 错误:', error.message);
  }
}

// 运行所有示例
async function main() {
  console.log('🚀 Vision API 示例\n');
  console.log('='.repeat(60) + '\n');

  await analyzeImageFromUrl();
  await analyzeLocalImage();
  await compareImages();
  await imageQA();

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ 所有示例完成');
}

main();
