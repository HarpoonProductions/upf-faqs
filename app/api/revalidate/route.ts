// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const body = await req.json()

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    // Trigger revalidation for the homepage (can add slugs later)
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/`, {
      next: { revalidate: 0 }
    })

    return NextResponse.json({ revalidated: true })
  } catch (err) {
    return NextResponse.json({ message: 'Revalidation error' }, { status: 500 })
  }
}
