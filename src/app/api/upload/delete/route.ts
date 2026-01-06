import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteFromR2, getKeyFromUrl } from '@/lib/r2';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication - only admins can delete
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, key } = body as { url?: string; key?: string };

    // Get the key from URL if not provided directly
    let imageKey = key;
    if (!imageKey && url) {
      imageKey = getKeyFromUrl(url) || undefined;
    }

    if (!imageKey) {
      return NextResponse.json(
        { error: 'No valid key or URL provided' },
        { status: 400 }
      );
    }

    // Delete from R2
    await deleteFromR2(imageKey);

    return NextResponse.json({
      success: true,
      deletedKey: imageKey,
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
