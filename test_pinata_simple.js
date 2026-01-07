#!/usr/bin/env node

/**
 * 简单的 Pinata IPFS 测试脚本
 * 直接从环境变量读取配置
 */

// 手动读取 .env 文件
const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  const envFile = fs.readFileSync(filePath, 'utf8');
  const env = {};
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });
  return env;
}

const env = loadEnv(path.join(__dirname, 'frontend', '.env'));

const PINATA_JWT = env.VITE_PINATA_JWT;
const PINATA_API_KEY = env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = env.VITE_PINATA_SECRET_KEY;

console.log('🔍 Pinata Configuration Check');
console.log('================================');
console.log('JWT exists:', !!PINATA_JWT);
console.log('JWT length:', PINATA_JWT ? PINATA_JWT.length : 0);
console.log('JWT preview:', PINATA_JWT ? PINATA_JWT.substring(0, 50) + '...' : 'N/A');
console.log('API Key:', PINATA_API_KEY || 'N/A');
console.log('Secret Key exists:', !!PINATA_SECRET_KEY);
console.log('');

if (!PINATA_JWT && !PINATA_API_KEY) {
  console.error('❌ Pinata not configured!');
  console.error('Please check frontend/.env file');
  process.exit(1);
}

// 测试 JSON 上传
async function testJSONUpload() {
  console.log('📤 Testing JSON upload to Pinata...');
  
  const testData = {
    name: 'Test NFT',
    description: 'This is a test NFT metadata',
    image: 'ipfs://QmTest123',
    attributes: [
      { trait_type: 'Test', value: 'Value' }
    ]
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
      console.log('Using JWT authentication');
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
      console.log('Using API Key authentication');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers,
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed!');
      console.error('Error response:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ JSON uploaded successfully!');
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log('');
    console.log('IPFS Hash:', data.IpfsHash);
    console.log('Full URI:', `ipfs://${data.IpfsHash}`);
    console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
    
    return data.IpfsHash;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// 主函数
async function main() {
  console.log('🚀 Starting Pinata test...\n');
  
  const jsonHash = await testJSONUpload();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Result:');
  console.log('  JSON Upload:', jsonHash ? '✅ PASS' : '❌ FAIL');
  console.log('');
  
  if (jsonHash) {
    console.log('🎉 Pinata is configured correctly!');
    console.log('');
    console.log('Next steps:');
    console.log('1. The Pinata configuration is working');
    console.log('2. The "Internal JSON-RPC error" is a contract/network issue');
    console.log('3. Check MetaMask network (should be Polygon Amoy)');
    console.log('4. Check contract address: 0xB70b8bd1Fe19464b440C352a89A664314b8Fe4B5');
    console.log('5. Try calling the contract directly with Hardhat');
  } else {
    console.log('⚠️  Pinata configuration issue!');
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check JWT token in frontend/.env');
    console.log('2. Verify JWT is not expired');
    console.log('3. Check Pinata account status');
    console.log('4. Try regenerating API keys');
  }
}

// 运行测试
main().catch(console.error);
