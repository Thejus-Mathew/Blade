import * as XLSX from "xlsx"


export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date) {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function calculateEvenSplit(totalAmount, numberOfPeople) {
  if (numberOfPeople === 0) return 0
  return Number.parseFloat((totalAmount / numberOfPeople).toFixed(2))
}

export function calculateRemainingEvenSplit(totalAmount, manualSplits, totalPeople) {
  const manualTotal = Object.values(manualSplits).reduce((sum, amount) => sum + amount, 0)
  const remaining = totalAmount - manualTotal
  const remainingPeople = totalPeople - Object.keys(manualSplits).length

  if (remainingPeople <= 0) return 0
  return Number.parseFloat((remaining / remainingPeople).toFixed(2))
}


export function exportToExcel(data, fileName, startDate, endDate) {
  const worksheet = XLSX.utils.json_to_sheet(data, { origin: "A2" }) // leave A1 for heading

  // Add heading
  XLSX.utils.sheet_add_aoa(worksheet, [[`Blade Expenses Report ( ${startDate} - ${endDate} )`]], { origin: "A1" })

  // Merge heading across all columns
  worksheet["!merges"] = [
    {
      s: { r: 0, c: 0 }, // Start cell (row 0, col 0)
      e: { r: 0, c: Object.keys(data[0]).length - 1 }, // End cell (row 0, last col)
    },
  ]

  // Set column widths
  worksheet["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }))

  // Center align and style cells
  const range = XLSX.utils.decode_range(worksheet["!ref"])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]
      if (!cell) continue

      cell.s = {
        alignment: { horizontal: "center", vertical: "center" },
        font: R === 1 ? { bold: true } : {}, // Row 1 (index 1) is column headers
      }
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses")

  // Write with styles
  XLSX.writeFile(workbook, `${fileName}.xlsx`, { cellStyles: true })
}


// Function to simplify dues by removing middlemen
export function simplifyDues(dues) {
  // Create a map to track net balances
  const netBalances = {}

  // Calculate net balance for each person
  for (const due of dues) {
    netBalances[due.from] = (netBalances[due.from] || 0) - due.amount
    netBalances[due.to] = (netBalances[due.to] || 0) + due.amount
  }

  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = []
  const debtors = []

  for (const [person, amount] of Object.entries(netBalances)) {
    if (amount > 0) {
      creditors.push({ id: person, amount })
    } else if (amount < 0) {
      debtors.push({ id: person, amount: -amount }) // Convert to positive for easier handling
    }
  }

  // Sort by amount (descending)
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  // Create simplified dues
  const simplifiedDues = []

  let i = 0 // Index for creditors
  let j = 0 // Index for debtors

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]

    const amount = Math.min(creditor.amount, debtor.amount)

    if (amount > 0) {
      simplifiedDues.push({
        from: debtor.id,
        to: creditor.id,
        amount: Number.parseFloat(amount.toFixed(2)),
      })
    }

    creditor.amount -= amount
    debtor.amount -= amount

    if (creditor.amount <= 0.01) i++ // Move to next creditor if current is settled (with small epsilon for floating point)
    if (debtor.amount <= 0.01) j++ // Move to next debtor if current is settled
  }

  return simplifiedDues
}
