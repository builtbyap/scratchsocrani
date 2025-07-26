import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
    }
    
    // Validate file parameter to prevent directory traversal
    if (file.includes('..') || file.includes('/') || file.includes('\\')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    // Define allowed files
    const allowedFiles = [
      'Socrani-Windows-Portable.zip',
      'test-download.txt',
      'Socrani-macOS.dmg.txt'
    ];
    
    if (!allowedFiles.includes(file)) {
      return NextResponse.json({ error: 'File not allowed' }, { status: 403 });
    }
    
    // Construct file path
    let filePath: string;
    
    if (file === 'Socrani-Windows-Portable.zip') {
      filePath = path.join(process.cwd(), 'public', 'downloads', 'dist', file);
    } else {
      filePath = path.join(process.cwd(), 'public', 'downloads', file);
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read file
    const fileBuffer = await fs.readFile(filePath);
    
    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${file}"`);
    headers.set('Cache-Control', 'no-cache');
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 