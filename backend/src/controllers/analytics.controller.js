import Result from "../models/Result.js";

export async function overview(req, res) {
  const rows = await Result.aggregate([
    { $group: {
      _id: null,
      average: { $avg: "$percentage" },
      count: { $sum: 1 },
      pass: { $sum: { $cond: [{ $gte: ["$percentage", 40] }, 1, 0] } }
    }}
  ]);
  const x = rows[0] || { average: 0, count: 0, pass: 0 };
  res.json({ success: true, data: { ...x, passRate: x.count ? (x.pass / x.count) * 100 : 0 } });
}