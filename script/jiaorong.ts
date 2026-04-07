#!/usr/bin/env bun

// 定义原始输入文本（完全复制你提供的内容）
const rawContent = `jiaorong-instruct	72b	128K	否
jiaorong-deepseek-v3.2	671b	160K	是
jiaorong-kimi-k2.5	1t	256K	是
jiaorong-glm-5	744b	198K	是
jiaorong-minimax-m2.5	229b	192k	否
jiaorong-qwen3.5-397b-a17b	397b	256k	是
jiaorong-qwen3.5-122b-a10b	122b	256K	是
jiaorong-qwen3.5-35b-a3b	35b	256K	是
jiaorong-glm-4.6v	106b	128K	是`;

// 定义结果类型（匹配目标JSON格式）
type ModelResult = Record<string, { name: string }>;
const result: ModelResult = {};

// 1. 按换行符分割所有行（兼容Windows/Linux换行）
const lines = rawContent.split(/\r?\n/);

// 2. 遍历解析每一行
for (const line of lines) {
  // 去除首尾空白字符，跳过空行
  const trimmedLine = line.trim();
  if (!trimmedLine) continue;

  // 按制表符 \t 分割列，提取第一列模型名称
  const [modelName] = trimmedLine.split('\t');
  
  // 填充数据结构
  result[modelName] = { name: modelName };
}

// 3. 序列化为格式化的JSON（缩进2空格，美观输出）
const jsonOutput = JSON.stringify(result, null, 2);

// 4. 打印最终结果
console.log(jsonOutput);
