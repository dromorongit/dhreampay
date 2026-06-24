import { auth } from '../../../lib/auth/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return auth(request, NextResponse);
}

export async function POST(request: NextRequest) {
  return auth(request, NextResponse);
}