import { connectDB } from '@/lib/mongodb/client'
import { Transaction } from '@/models'

export async function GET() {
  await connectDB()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const pipeline = [
    {
      $match: {
        transactionDate: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' },
          },
          source: '$source',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.date': 1 },
    },
  ] as any

  const results = await Transaction.aggregate(pipeline)
  const chartData = results.reduce((acc: any, item: any) => {
    const date = item._id.date
    if (!acc[date]) {
      acc[date] = { date, BANK: 0, VISA: 0 }
    }
    acc[date][item._id.source] = item.count
    return acc
  }, {})

  return Response.json(Object.values(chartData))
}