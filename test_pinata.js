#!/usr/bin/env node

/**
 * Pinata IPFS 测试脚本
 * 测试 Pinata API 是否正常工作
 */

const fs = require('fs');
const path = require('path');

// 从 .env 文件读取配置
require('dotenv').config({ path: path.join(__dirname, 'frontend', '.env') });

const PINATA_JWT = process.env.VITE_PINATA_JWT;
const PINATA_API_KEY = process.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.VITE_PINATA_SECRET_KEY;

console.log('🔍 Pinata Configuration Check');
console.log('================================');
console.log('JWT exists:', !!PINATA_JWT);
console.log('JWT length:', PINATA_JWT ? PINATA_JWT.length : 0);
console.log('API Key exists:', !!PINATA_API_KEY);
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
      ...(PINATA_JWT
        ? { Authorization: `Bearer ${PINATA_JWT}` }
        : {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          }),
    };

    console.log('Using authentication:', PINATA_JWT ? 'JWT' : 'API Keys');

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers,
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ JSON uploaded successfully!');
    console.log('IPFS Hash:', data.IpfsHash);
    console.log('Full URI:', `ipfs://${data.IpfsHash}`);
    console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
    
    return data.IpfsHash;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// 测试文件上传
async function testFileUpload() {
  console.log('\n📤 Testing file upload to Pinata...');
  
  // 创建一个测试文件
  const testContent = 'This is a test file for Pinata upload';
  const testFileName = 'test.txt';
  
  try {
    // 使用 FormData (需要 node-fetch v3 或使用 form-data 包)
    const FormData = require('form-data');
    const formData = new FormData();
    
    // 添加文件内容
    formData.append('file', Buffer.from(testContent), {
      filename: testFileName,
      contentType: 'text/plain',
    });

    const metadata = JSON.stringify({
      name: testFileName,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const headers = PINATA_JWT
      ? { Authorization: `Bearer ${PINATA_JWT}`, ...formData.getHeaders() }
      : {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          ...formData.getHeaders(),
        };

    const fetch = require('node-fetch');
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ File uploaded successfully!');
    console.log('IPFS Hash:', data.IpfsHash);
    console.log('Full URI:', `ipfs://${data.IpfsHash}`);
    console.log('Gateway URL:', `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
    
    return data.IpfsHash;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Note: File upload requires form-data package');
    console.error('Install with: npm install form-data node-fetch@2');
    return null;
  }
}

// 主函数
async function main() {
  console.log('🚀 Starting Pinata tests...\n');
  
  // 测试 JSON 上传
  const jsonHash = await testJSONUpload();
  
  if (jsonHash) {
    console.log('\n✅ Pinata JSON upload is working!');
  } else {
    console.log('\n❌ Pinata JSON upload failed!');
  }
  
  // 测试文件上传
  console.log('\n' + '='.repeat(50));
  const fileHash = await testFileUpload();
  
  if (fileHash) {
    console.log('\n✅ Pinata file upload is working!');
  } else {
    console.log('\n❌ Pinata file upload failed (or form-data not installed)!');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary:');
  console.log('  JSON Upload:', jsonHash ? '✅ PASS' : '❌ FAIL');
  console.log('  File Upload:', fileHash ? '✅ PASS' : '❌ FAIL (or skipped)');
  console.log('');
  
  if (jsonHash) {
    console.log('🎉 Pinata is configured correctly!');
    console.log('The "Internal JSON-RPC error" is likely a contract or network issue.');
  } else {
    console.log('⚠️  Pinata configuration issue detected!');
    console.log('Please check your Pinata credentials in frontend/.env');
  }
}

// 运行测试
main().catch(console.error);
