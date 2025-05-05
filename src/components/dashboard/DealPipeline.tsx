
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Sample data for the pipeline chart
const pipelineData = [
  { stage: 'Lead', count: 14, value: 158000, color: '#f97316' },
  { stage: 'Qualified', count: 8, value: 96000, color: '#eab308' },
  { stage: 'Proposal', count: 6, value: 84000, color: '#3b82f6' },
  { stage: 'Negotiation', count: 3, value: 105000, color: '#8b5cf6' },
  { stage: 'Closed Won', count: 4, value: 142500, color: '#22c55e' },
  { stage: 'Closed Lost', count: 2, value: 48000, color: '#ef4444' },
];

export function DealPipeline() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={pipelineData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <XAxis 
            dataKey="stage" 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']}
            labelStyle={{ fontWeight: 'bold' }}
            contentStyle={{ 
              borderRadius: '8px', 
              backgroundColor: 'white',
              border: '1px solid #ddd',
              padding: '8px'
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {pipelineData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
