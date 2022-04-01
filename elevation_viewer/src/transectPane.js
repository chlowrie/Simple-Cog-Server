import { useRef, useState } from 'react'
import { CartesianGrid, Legend, Label, Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function LineGraph({data}) {
    console.log(data)
    return (
        <ResponsiveContainer className='profile-chart' width="50%" height={220}>
             <AreaChart width={500} height={300} data={data}>
                <XAxis dataKey="perc" tickFormatter={tick => {
                        return Math.round(tick, 2) + '%'
                    }}/>
                <YAxis dataKey="z" type="number" domain={['auto', 'auto']}/>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                <Area type="monotone" dataKey="z" stroke="#8884d8" />
            </AreaChart>
        </ResponsiveContainer>
    );
}