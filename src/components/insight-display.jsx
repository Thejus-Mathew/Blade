"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"
import { CreditCard, IndianRupee, Users, PieChartIcon, TrendingUp } from "lucide-react"
import Card from "./card"


const COLORS = [
  "#8dd1e1",
  "#83a6ed",
  "#8884d8",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
]

export default function InsightDisplay({ members, types, expenses }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [individual,setIndividual]=useState(members[0]?._id || null)
  const [individualData,setIndividualData]=useState({timeData:[],typeData:[]})
  
  useEffect(()=>{
    setIndividualData(()=>{
      const arr = []
      expenses.forEach(item=>{
        const split = item.splits.find(item2=>item2.member._id===individual)
        if(split){
          arr.push({member:split.member.name,amount:split.amount,type:item.type,date:format(parseISO(item.date), 'yyyy-MM')})
        }
      })
      const timeData = arr.reduce((obj,item)=>{
        obj[item.date]=(obj[item.date] || 0)+item.amount
        return obj
      },{})
      const typeData = arr.reduce((obj,item)=>{
        obj[item.type]=(obj[item.type] || 0) + item.amount
        return obj
      },{})
      return {timeData:Object.entries(timeData).map(([date,amount])=>({date,amount})).sort((a, b) => a.date.localeCompare(b.date)),typeData:Object.entries(typeData).map(([name,amount])=>({name,amount})).sort((a, b) => b.amount - a.amount)}
    })
  },[individual,expenses])  

  const[isDarkMode,setIsDarkMode] = useState(true)
  useEffect(() => {
    setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
  }, []);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0)

  const memberSpendingData = members
    .map((member) => {
      const spent = expenses
        .filter((expense) => expense.paidBy.name === member.name)
        .reduce((sum, expense) => sum + expense.totalAmount, 0)

      return {
        name: member.name,
        amount: spent,
      }
    })
    .sort((a, b) => b.amount - a.amount)

  const expenseTypeData = types
    .map((type) => {
      const amount = expenses
        .filter((expense) => expense.type === type.name)
        .reduce((sum, expense) => sum + expense.totalAmount, 0)

      return amount?{
        name: type.name,
        amount,
      }:null
    }).filter(Boolean)
    .sort((a, b) => b.amount - a.amount)

  const paymentMethodsMap = expenses.reduce((acc, expense) => {
    acc[expense.paidThrough] = (acc[expense.paidThrough] || 0) + expense.totalAmount
    return acc
  }, {})

  const paymentMethodsData = Object.entries(paymentMethodsMap).map(([method, amount]) => ({
    name: method,
    value: amount,
  }))

  // Prepare data for time series chart
  const timeSeriesData = (() => {
    const expensesByDate = expenses.reduce((acc, expense) => {
      const date = format(parseISO(expense.date), 'yyyy-MM')
      acc[date] = (acc[date] || 0) + expense.totalAmount
      return acc
    }, {})

    // Convert to array and sort by date
    return Object.entries(expensesByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
  })()

  // Calculate who owes whom
  const calculateBalances = () => {
    const balances = {}

    // Initialize balances for all members
    members.forEach((member) => {
      balances[member.name] = {}
      members.forEach((otherMember) => {
        if (member.name !== otherMember.name) {
          balances[member.name][otherMember.name] = 0
        }
      })
    })

    // Calculate balances based on expenses
    expenses.forEach((expense) => {
      const payer = expense.paidBy.name

      expense.splits.forEach((split) => {
        const receiver = split.member.name
        if (payer !== receiver) {
          balances[receiver][payer] = (balances[receiver][payer] || 0) + split.amount
          balances[payer][receiver] = (balances[payer][receiver] || 0) - split.amount
        }
      })
    })

    // Simplify balances (only keep positive values - who owes whom)
    const simplifiedBalances = []

    members.forEach((member) => {
      members.forEach((otherMember) => {
        if (member.name !== otherMember.name) {
          const balance = balances[member.name][otherMember.name]
          if (balance > 0) {
            simplifiedBalances.push({
              from: member.name,
              to: otherMember.name,
              amount: balance,
            })
          }
        }
      })
    })

    return simplifiedBalances.sort((a, b) => b.amount - a.amount)
  }

  const balances = calculateBalances()

  // Calculate individual spending
  const individualSpending = members
    .map((member) => {
      const totalSpent = expenses.reduce((sum, expense) => {
        const memberSplit = expense.splits.find((split) => split.member.name === member.name)
        return sum + (memberSplit?.amount || 0)
      }, 0)

      return {
        name: member.name,
        amount: totalSpent,
      }
    })
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between flex-wrap gap-4 pb-8">
        <Card className="flex-1 min-w-[200px]">
            <p className="flex justify-between items-center">
                <span>Total Expenses</span>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </p>
            <h2 className="text-2xl font-bold my-4">₹{totalExpenses.toFixed(2)}</h2>
            <p className="text-xs text-muted-foreground">Across {expenses.length} transactions</p>
        </Card>
        <Card className="flex-1 min-w-[200px]">
            <p className="flex justify-between items-center">
                <span>Top Spender</span>
                <Users className="h-4 w-4 text-muted-foreground" />
            </p>
            <p className="text-2xl font-bold my-4">
              {memberSpendingData.length > 0 ? memberSpendingData[0].name : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {memberSpendingData.length > 0
                ? `₹${memberSpendingData[0].amount.toFixed(2)} spent`
                : "No data available"}
            </p>
        </Card>
        <Card className="flex-1 min-w-[200px]">
            <p className="flex justify-between items-center">
                <span>Top Category</span>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </p>
            <h2 className="text-2xl font-bold my-4">{expenseTypeData.length > 0 ? expenseTypeData[0].name : "N/A"}</h2>
            <p className="text-xs text-muted-foreground">{expenseTypeData.length > 0 ? `₹${expenseTypeData[0].amount.toFixed(2)}` : "No data available"}</p>
        </Card>
        <Card className="flex-1 min-w-[200px]">
            <p className="flex justify-between items-center">
                <span>Largest Transaction</span>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </p>
            <h2 className="text-2xl font-bold my-4">₹
              {expenses.length > 0
                ? Math.max(...expenses.map((e) => e.totalAmount)).toFixed(2)
                : "0.00"}
            </h2>
            <p className="text-xs text-muted-foreground">
                {expenses.length > 0
                ? `Paid by ${expenses.sort((a, b) => b.totalAmount - a.totalAmount)[0].paidBy.name}`
                : "No transactions"}
            </p>
        </Card>        
      </div>
      <div className="flex gap-4 bg-gray-100 dark:bg-gray-800 p-2 py-4 w-full ps-4 rounded-md w-fit flex-wrap">
        <button onClick={() => setActiveTab("Overview")} 
            className={`px-3 border py-1 rounded-md text-sm font-medium transition ${activeTab === "Overview"
                ? "bg-white dark:bg-gray-200 text-black dark:text-black shadow-sm"
                : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"}`}
        >
            Overview
        </button>
        <button onClick={() => setActiveTab("Members")} 
            className={`px-3 border py-1 rounded-md text-sm font-medium transition ${activeTab === "Members"
                ? "bg-white dark:bg-gray-200 text-black dark:text-black shadow-sm"
                : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"}`}
        >
            Members
        </button>
        <button onClick={() => setActiveTab("Categories")} 
            className={`px-3 border py-1 rounded-md text-sm font-medium transition ${activeTab === "Categories"
                ? "bg-white dark:bg-gray-200 text-black dark:text-black shadow-sm"
                : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"}`}
        >
            Categories
        </button>
        <button onClick={() => setActiveTab("Individual")} 
            className={`px-3 border py-1 rounded-md text-sm font-medium transition ${activeTab === "Individual"
                ? "bg-white dark:bg-gray-200 text-black dark:text-black shadow-sm"
                : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"}`}
        >
            Individual
        </button>
        <button onClick={() => setActiveTab("Balances")} 
            className={`px-3 border py-1 rounded-md text-sm font-medium transition ${activeTab === "Balances"
                ? "bg-white dark:bg-gray-200 text-black dark:text-black shadow-sm"
                : "text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white"}`}
        >
            Balances
        </button>
      </div>
      {
        activeTab==="Overview"?
        <div className="grid gap-4 md:grid-cols-2 pb-8">
            <Card title="Expenses Over Time" titleDescription="Spending trends over the selected period">
                <div className="h-[300px]">
                  {timeSeriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), "yyyy MMM")} tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <YAxis tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <Tooltip
                        contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Expense Amount"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center py-8">
                      <p className="text-muted-foreground">No data available for the selected period</p>
                    </div>
                  )}
                </div>
            </Card>
            <Card title="Payment Methods" titleDescription="Distribution of expenses by payment method">
                <div className="h-[300px]">
                  {paymentMethodsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentMethodsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]} 
                        contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }} 
                        itemStyle={{
                          color: isDarkMode ? "#ffffff" : "#000000"
                        }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No data available for the selected period</p>
                    </div>
                  )}
                </div>
            </Card>
        </div>
        :activeTab==="Members"?
        <div className="grid gap-4 md:grid-cols-2 pb-8">
            <Card title="Expenses Paid By Member" titleDescription="Who paid for what">
                <div className="h-[300px]">
                  {memberSpendingData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={memberSpendingData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]}
                        contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }} />
                        <Legend />
                        <Bar dataKey="amount" name="Amount Paid" fill="#8884d8"/>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No data available for the selected period</p>
                    </div>
                  )}
                </div>
            </Card>
            <Card title="Individual Spending" titleDescription="How much each person actually spent">
                <div className="h-[300px]">
                  {individualSpending.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={individualSpending}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <Tooltip 
                        contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }} formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]} />
                        <Legend />
                        <Bar dataKey="amount" name="Amount Spent" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No data available for the selected period</p>
                    </div>
                  )}
                </div>
            </Card>
        </div>
        :activeTab==="Categories"?
        <div className="grid gap-4 md:grid-cols-2 pb-8">
          <Card title="Expenses by Category" titleDescription="Breakdown of expenses by category">
            <div className="h-[300px]">
                {expenseTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expenseTypeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }} />
                        <YAxis tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]}
                        contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }} />
                        <Legend />
                        <Bar dataKey="amount" name="Amount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
          </Card>
          <Card title="Expense Type Distribution" titleDescription="Breakdown of expense types by category">
            <div className="h-[300px]">
                {expenseTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {expenseTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]} 
                          contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }}
                        itemStyle={{
                          color: isDarkMode ? "#ffffff" : "#000000"
                        }}/>
                        {/* <Legend /> */}
                      </PieChart>
                    </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
          </Card>
        </div>
        :activeTab==="Individual"?
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Individual Insight</h3>
                  <p className="text-xs text-muted-foreground mt-2">Each members spending trend</p>
                </div>
                <span className="flex items-center pe-5 justify-end">
                  <select className="border w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 md:w-75" onChange={(e)=>setIndividual(e.target.value)}>
                    {
                      members.map(item=>(
                        <option value={item._id} key={item._id} className="dark:text-gray-800">{item.name}</option>
                      ))
                    }
                  </select>
                </span>
              </div>
            <div className="p-6 grid gap-4 md:grid-cols-2">
              <div className="h-[300px]">
                {individualData.timeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={individualData.timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), "yyyy MMM")} tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                      <YAxis tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                      <Tooltip
                      contentStyle={{
                          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                          color: isDarkMode ? "#ffffff" : "#000000",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                      }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Expense Amount"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center py-8">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
              <div className="h-[300px]">
                {individualData.typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={individualData.typeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }} />
                        <YAxis tick={{ fill: isDarkMode ? "#b9b9b9" : "#707070" }}/>
                        <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, "Amount"]}
                        contentStyle={{
                            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                            color: isDarkMode ? "#ffffff" : "#000000",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }} />
                        <Legend />
                        <Bar dataKey="amount" name="Amount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        :activeTab==="Balances"?
        <div className="grid gap-4 pb-8">
          <Card title="Dues on filtered Expenses" titleDescription="Outstanding balances between members">
                {balances.length > 0 ? (
                <div className="space-y-4">
                  {balances.map((balance, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{balance.from}</p>
                          <p className="text-sm text-muted-foreground">owes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-right">{balance.to}</p>
                          <p className="text-sm text-muted-foreground text-right">₹{balance.amount.toFixed(2)}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">No outstanding balances for the selected period</p>
                </div>
              )}
          </Card>
        </div>
        :null
      }
    </div>
  )
}
