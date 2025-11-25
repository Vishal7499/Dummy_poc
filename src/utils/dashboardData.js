// Direct data generation for Dashboard - No API calls needed

// Generate random number in range
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min, max) => Math.random() * (max - min) + min

// Generate date range
const generateDateRange = (fromDate, toDate) => {
  const dates = []
  const start = new Date(fromDate)
  const end = new Date(toDate)
  const current = new Date(start)
  
  while (current <= end) {
    dates.push(new Date(current).toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

// Generate dashboard data based on date range
export const generateDashboardData = (fromDate, toDate) => {
  const totalCases = random(75000, 120000)
  const activeCases = random(45000, 70000)
  const resolvedCases = random(30000, 50000)
  
  return {
    total_cases: totalCases,
    active_cases: activeCases,
    resolved_cases: resolvedCases,
    total_collection: random(800000000, 2500000000),
    today_collection: random(10000000, 60000000),
    monthly_collection: random(200000000, 800000000),
    collection_efficiency: randomFloat(70, 95),
    staff_count: random(150, 600),
    active_staff: random(120, 550),
    pending_allocations: random(2000, 8000),
    completed_allocations: random(8000, 30000)
  }
}

// Generate collection graph data
export const generateCollectionGraphData = (fromDate, toDate) => {
  const dates = generateDateRange(fromDate || '2025-01-01', toDate || '2025-12-30')
  const day = dates.map(d => d.split('-')[2] + '-' + d.split('-')[1])
  const collection = dates.map(() => random(1000000, 10000000))
  const target = dates.map(() => random(8000000, 12000000))
  
  return {
    from_date: fromDate || '2025-01-01',
    to_date: toDate || '2025-12-30',
    day,
    collection,
    target
  }
}

// Generate deposition data
export const generateDepositionData = (fromDate, toDate, page = 1, pageSize = 20) => {
  const totalRecords = random(200, 800)
  const totalPages = Math.ceil(totalRecords / pageSize)
  const actualPageSize = page === totalPages ? (totalRecords % pageSize || pageSize) : pageSize
  
  const depositions = Array.from({ length: actualPageSize }, (_, i) => ({
    id: (page - 1) * pageSize + i + 1,
    case_id: `CASE${String((page - 1) * pageSize + i + 1).padStart(6, '0')}`,
    customer_name: `Customer ${(page - 1) * pageSize + i + 1}`,
    amount: random(75000, 750000),
    date: new Date(Date.now() - random(1, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: ['Pending', 'Completed', 'In Progress'][random(0, 2)],
    loan_type: ['Home Loan', 'Tractor Finance', 'Commercial Vehicle', 'Construction Equipment'][random(0, 3)],
    dpd: random(1, 180),
    branch: `Branch ${random(1, 50)}`,
    staff_name: `Staff ${random(1, 100)}`
  }))
  
  return {
    depositions,
    pagination: {
      current_page: page,
      page_size: pageSize,
      total_count: totalRecords,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1
    }
  }
}

// Generate vertical summary data
export const generateVerticalSummaryData = (fromDate, toDate) => {
  const verticals = ['Home Loan', 'Tractor Finance', 'Commercial Vehicle', 'Construction Equipment']
  
  const generateVerticalData = () => {
    const total = random(10000, 50000)
    const good = Math.floor(total * randomFloat(0.6, 0.8))
    const npa = Math.floor(total * randomFloat(0.1, 0.2))
    const sma0 = Math.floor(total * randomFloat(0.05, 0.1))
    const sma1 = Math.floor(total * randomFloat(0.03, 0.08))
    const sma2 = total - good - npa - sma0 - sma1
    
    return {
      total,
      good,
      npa,
      sma0,
      sma1,
      sma2: sma2 > 0 ? sma2 : random(100, 1000)
    }
  }
  
  const summary = verticals.map(product => ({
    product,
    ...generateVerticalData()
  }))
  
  const allocation = verticals.map(product => ({
    product,
    ...generateVerticalData()
  }))
  
  // Generate individual table data
  const acm = verticals.map(product => ({ product, ...generateVerticalData() }))
  const allocationAdmin = verticals.map(product => ({ product, ...generateVerticalData() }))
  const bo = verticals.map(product => ({ product, ...generateVerticalData() }))
  const clm = verticals.map(product => ({ product, ...generateVerticalData() }))
  const dtr = verticals.map(product => ({ product, ...generateVerticalData() }))
  const ncm = verticals.map(product => ({ product, ...generateVerticalData() }))
  const rcm = verticals.map(product => ({ product, ...generateVerticalData() }))
  const tcm = verticals.map(product => ({ product, ...generateVerticalData() }))
  
  return {
    'vertical summary': summary,
    'vertical allocation summary': allocation,
    ACM: acm,
    ALLOCATION_ADMIN: allocationAdmin,
    BO: bo,
    CLM: clm,
    DTR: dtr,
    NCM: ncm,
    RCM: rcm,
    TCM: tcm
  }
}

// Generate collection summary data
export const generateCollectionSummaryData = (fromDate, toDate) => {
  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh']
  const regions = ['North', 'South', 'East', 'West', 'Central']
  const buckets = ['0-30', '31-60', '61-90', '91-120', '121-180', '180+']
  
  const stateWise = states.map(state => {
    const totalCases = random(2000, 15000)
    const outstanding = randomFloat(80, 800) // in Cr
    const resolutionCount = random(500, 5000)
    const resolutionAmount = randomFloat(20, 300) // in Cr
    
    return {
      STATE: state,
      TotalCases: totalCases,
      'Outstanding Balance (in Cr.)': outstanding,
      'Resolution Count': resolutionCount,
      'Resolution Count%': randomFloat(15, 45),
      'Resolution Amount': resolutionAmount,
      'Resolution Amount %': randomFloat(20, 50)
    }
  })
  
  const regionWise = regions.map(region => {
    const cases = random(8000, 40000)
    const outstanding = randomFloat(300, 3000) // in Cr
    const resolutionCount = random(2000, 15000)
    const resolutionAmount = randomFloat(80, 1200) // in Cr
    
    return {
      LOCATION: region,
      Cases: cases,
      'Outstanding balance': outstanding,
      'Resolution count': resolutionCount,
      'Resolution Count%': randomFloat(18, 48),
      'Resolution amount': resolutionAmount,
      'Resolution Amount%': randomFloat(22, 52)
    }
  })
  
  const bucketWise = buckets.map(bucket => {
    const cases = random(3000, 25000)
    const outstanding = randomFloat(150, 1500) // in Cr
    const resolutionCount = random(800, 8000)
    const resolutionAmount = randomFloat(30, 600) // in Cr
    
    return {
      BUCKET: bucket,
      Cases: cases,
      'Outstanding balance': outstanding,
      'Resolution count': resolutionCount,
      'Resolution Count%': randomFloat(10, 40),
      'Resolution amount': resolutionAmount,
      'Resolution Amount%': randomFloat(15, 45)
    }
  })
  
  return {
    'collection state wise summary': stateWise,
    'collection location wise summary': regionWise,
    'collection bucket wise summary': bucketWise
  }
}

// Generate report type data (FTD, MTD, YTD)
export const generateReportData = (reportType, fromDate, toDate) => {
  const reportTypes = {
    'ftd': {
      title: 'FTD Summary',
      data: {
        total_cases: random(10000, 50000),
        total_outstanding: random(500000000, 2000000000),
        collection_amount: random(100000000, 800000000),
        efficiency: randomFloat(60, 95)
      }
    },
    'mtd': {
      title: 'MTD Summary',
      data: {
        total_cases: random(15000, 60000),
        total_outstanding: random(600000000, 2500000000),
        collection_amount: random(150000000, 1000000000),
        efficiency: randomFloat(65, 95)
      }
    },
    'ytd': {
      title: 'YTD Summary',
      data: {
        total_cases: random(50000, 200000),
        total_outstanding: random(2000000000, 10000000000),
        collection_amount: random(500000000, 5000000000),
        efficiency: randomFloat(70, 95)
      }
    }
  }
  
  return reportTypes[reportType] || reportTypes['ftd']
}

