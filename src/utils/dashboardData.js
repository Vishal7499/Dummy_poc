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
  // Fixed values from screenshots
  const totalLoans = 187406
  const uniqueStaff = 1161
  const avgLoansPerStaff = 161.42
  const totalTosInCr = 404.56
  const unallocatedCases = 23
  const collectionPercentage = 58.77
  const collectionAmountCr = 103.4
  const totalDueCr = 72.54
  
  return {
    total_cases: random(75000, 120000),
    active_cases: random(45000, 70000),
    resolved_cases: random(30000, 50000),
    total_collection: random(800000000, 2500000000),
    today_collection: random(10000000, 60000000),
    monthly_collection: random(200000000, 800000000),
    collection_efficiency: collectionPercentage,
    staff_count: random(150, 600),
    active_staff: random(120, 550),
    pending_allocations: random(2000, 8000),
    completed_allocations: random(8000, 30000),
    collection_data: {
      collection_percentage: collectionPercentage,
      collection_amount_cr: collectionAmountCr,
      total_overdue_cr: totalDueCr
    },
    case_summary_count: random(5000, 15000),
    loan_data: {
      total_loans: totalLoans,
      unique_staff: uniqueStaff,
      avg_loans_per_staff: avgLoansPerStaff,
      total_tos_in_cr: totalTosInCr,
      unallocated_cases: unallocatedCases
    }
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
  // Fixed values from screenshot: 0 records, page 1, total pages 1, date range 2025-10-26 to 2025-11-25
  const totalRecords = 0
  const totalPages = 1
  const actualPageSize = 0
  
  const depositions = []
  
  return {
    depositions,
    from_date: fromDate || '2025-10-26',
    to_date: toDate || '2025-11-25',
    pagination: {
      current_page: page,
      page_size: pageSize,
      total_count: totalRecords,
      total_pages: totalPages,
      has_next: false,
      has_previous: false
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

// Generate Roll Rate data
export const generateRollRateData = (fromDate, toDate) => {
  const totalRollBacks = random(150, 500)
  const totalRollForwards = random(200, 600)
  
  return {
    rollBack: {
      total: totalRollBacks,
      pending: random(20, totalRollBacks * 0.3),
      completed: totalRollBacks - random(20, totalRollBacks * 0.3),
      amount: random(5000000, 50000000)
    },
    rollForward: {
      total: totalRollForwards,
      pending: random(30, totalRollForwards * 0.4),
      completed: totalRollForwards - random(30, totalRollForwards * 0.4),
      amount: random(8000000, 80000000)
    }
  }
}

// Generate Customer Engagement data
export const generateCustomerEngagementData = (fromDate, toDate) => {
  // Fixed values from screenshots
  return {
    whatsapp: {
      messagesSent: 234599,
      delivered: 220400,
      read: 185750,
      responded: 130299
    },
    aiCalls: {
      callsTriggered: 125677,
      answered: 120455,
      positiveResponse: 81473
    },
    diallerCalls: {
      totalCalls: 60987,
      successfulConnects: 55854,
      followUpActions: 38895
    },
    fieldVisits: {
      plannedVisits: 30870,
      completedVisits: 22903,
      geotaggingCompliance: null // Dash in screenshot
    }
  }
}

// Generate Payment Intent data
export const generatePaymentIntentData = (fromDate, toDate) => {
  const overdueAccounts = random(30, 80)
  const overdueAmount = randomFloat(0.8, 2.5) // in Cr
  
  return {
    overdueAccounts: {
      customerCount: overdueAccounts,
      amount: overdueAmount
    },
    promisedToPay: {
      todayPTP: random(50, 200),
      failedPTP: random(10, 50),
      futurePTP: random(100, 400),
      totalPTP: random(200, 600)
    },
    refusedToPay: {
      customers: random(5, 30),
      pendingAmount: randomFloat(0.2, 1.5) // in Cr
    },
    alreadyPaid: {
      customers: random(20, 100),
      collectedAmount: randomFloat(0.5, 3.0) // in Cr
    },
    brokenPromises: {
      customers: random(15, 60),
      brokenAmount: randomFloat(0.3, 2.0) // in Cr
    },
    wrongNumbers: {
      invalidContacts: random(50, 200),
      status: 'Data Correction'
    }
  }
}

