import { type NextRequest, NextResponse } from 'next/server'

import { getInterestHistory } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params
    if (!address) {
      return NextResponse.json({ error: 'address is required' }, { status: 400 })
    }

    const snapshots = getInterestHistory(address.toLowerCase())

    return NextResponse.json({ snapshots })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
