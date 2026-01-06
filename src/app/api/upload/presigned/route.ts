import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPresignedUploadUrl, isValidImageType, ImageFolder } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admins can upload
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, contentType, folder } = body as {
      filename: string;
      contentType: string;
      folder?: ImageFolder;
    };

    // Validate required fields
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: filename and contentType' },
        { status: 400 }
      );
    }

    // Validate content type
    if (!isValidImageType(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, AVIF' },
        { status: 400 }
      );
    }

    // Validate folder
    const validFolders: ImageFolder[] = ['products', 'recipes', 'categories', 'game-types', 'misc'];
    const imageFolder: ImageFolder = validFolders.includes(folder as ImageFolder)
      ? (folder as ImageFolder)
      : 'misc';

    // Get presigned URL
    const { uploadUrl, publicUrl, key } = await getPresignedUploadUrl(
      filename,
      contentType,
      imageFolder
    );

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
