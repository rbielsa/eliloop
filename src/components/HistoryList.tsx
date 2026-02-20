import type { RowEntry } from '../types'
import { formatDate } from '../utils/formatDate'

type HistoryListProps = {
  entries: RowEntry[]
}

export function HistoryList({ entries }: HistoryListProps) {
  const lastFive = entries.slice(-5).reverse()
  if (lastFive.length === 0) return null
  return (
    <ul className="history-list glass">
      {lastFive.map((entry, i) => (
        <li key={`${entry.rowNumber}-${entry.timestamp}-${i}`} className="history-item">
          <span className="history-row">Vuelta {entry.rowNumber}</span>
          <span className="history-time">{formatDate(entry.timestamp)}</span>
        </li>
      ))}
    </ul>
  )
}
