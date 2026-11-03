import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { formatEuro } from '../../utils/format.js'

// Spending by category, as a pie or as columns
export default function SpendingChart({ d, onAdd }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Spending by category</h2>
        <div className="segmented small">
          <button className={d.chartType === 'pie' ? 'on' : ''} onClick={() => d.setChartType('pie')}>Pie</button>
          <button className={d.chartType === 'bar' ? 'on' : ''} onClick={() => d.setChartType('bar')}>Columns</button>
        </div>
      </div>

      {d.chartData.length === 0 ? (
        <div className="empty">
          <p>No expenses for this period.</p>
          <button className="btn primary" onClick={onAdd}>Add one</button>
        </div>
      ) : (
        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            {d.chartType === 'pie' ? (
              <PieChart>
                <Pie data={d.chartData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={2}>
                  {d.chartData.map((x) => <Cell key={x.name} fill={x.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatEuro(v)} />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={d.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => '€' + v} width={60} />
                <Tooltip formatter={(v) => formatEuro(v)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {d.chartData.map((x) => <Cell key={x.name} fill={x.color} />)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
