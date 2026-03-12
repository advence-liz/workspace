/**
 * 检查所有 demo 的正确性
 */

import { readFileSync } from 'fs';

const demos = [
  'demos/01-basic-react-agent.js',
  'demos/02-search-agent.js',
  'demos/03-calculator-agent.js',
  'demos/04-memory-agent.js',
  'demos/05-custom-tools-agent.js',
  'demos/06-multi-agent-collaboration.js',
  'demos/07-structured-output-agent.js',
  'demos/08-error-handling-agent.js',
];

console.log('🔍 检查所有 demo 文件...\n');

const checks = {
  total: 0,
  passed: 0,
  failed: 0,
  issues: []
};

demos.forEach((file, index) => {
  console.log(`\n[${index + 1}/${demos.length}] ${file}`);
  console.log('-'.repeat(60));
  
  try {
    const content = readFileSync(file, 'utf-8');
    checks.total++;
    
    const issues = [];
    
    // 检查导入
    if (!content.includes('from "./config.js"')) {
      issues.push('❌ 未导入 config.js');
    } else {
      console.log('✅ 导入 config.js');
    }
    
    // 检查使用 getLLMConfig
    if (!content.includes('getLLMConfig')) {
      issues.push('❌ 未使用 getLLMConfig');
    } else {
      console.log('✅ 使用 getLLMConfig');
    }
    
    // 检查调用 checkEnvConfig
    if (!content.includes('checkEnvConfig()')) {
      issues.push('❌ 未调用 checkEnvConfig');
    } else {
      console.log('✅ 调用 checkEnvConfig');
    }
    
    // demo4 特殊检查
    if (file.includes('04-memory-agent')) {
      if (content.includes('pull("hwchase17/react-chat")')) {
        issues.push('⚠️  使用了 react-chat');
      } else if (content.includes('PromptTemplate.fromTemplate')) {
        console.log('✅ 使用自定义 Prompt');
      }
      
      if (!content.includes('{chat_history}')) {
        issues.push('❌ 缺少 {chat_history}');
      } else {
        console.log('✅ 包含 {chat_history}');
      }
    }
    
    if (issues.length === 0) {
      console.log('✅ 通过');
      checks.passed++;
    } else {
      console.log('问题:');
      issues.forEach(i => console.log('  ' + i));
      checks.failed++;
      checks.issues.push({ file, issues });
    }
    
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`);
    checks.failed++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`总计: ${checks.total} | 通过: ${checks.passed} | 失败: ${checks.failed}`);
console.log('='.repeat(60));

if (checks.issues.length > 0) {
  console.log('\n⚠️  需要修复:');
  checks.issues.forEach(({ file, issues }) => {
    console.log(`\n${file}:`);
    issues.forEach(i => console.log(`  ${i}`));
  });
}
