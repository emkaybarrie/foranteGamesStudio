import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from './auth.js';
import { categories, subCategories } from './config.js'; // Categories for mandatory, discretionary

// Function to process transactions from Google Sheets
export async function getCashflowData(playerDataInput = null) {
    // Initialise Function Variables to be exported
    let dAvgIncome = null
    let dAvgSpending_Mandatory = null
    let dAvgSpending_Supplementary = null
    let dAvgSpending_Discretionary = null
    let dAvgSpending_Discretionary_Growth = null
    let dAvgSpending_Discretionary_Wants = null
    let dAvgSpending_Discretionary_Needs = null
    let dAvgBalance = null
    
    // Get Local Storage Variables
    const playerData = playerDataInput ?  playerDataInput : JSON.parse(localStorage.getItem('playerData'))

    // Retreive PlayerData variables
    let availableTransactionStartDate = null
        if (playerData.financeSummary.transactionStartDate){
            const [day, month, year] = playerData.financeSummary.transactionStartDate.split("/");
            availableTransactionStartDate = new Date(`${year}-${month}-${day}`);  
        } else {
            availableTransactionStartDate = playerData.startDate ? playerData.startDate.toDate() : null;
            if (!availableTransactionStartDate) {
                console.error("Start date is missing!");
                return;
            }
        }

    const transactionsStartDate = availableTransactionStartDate    
    const daysSinceFirstTransaction = parseFloat((new Date() - new Date(transactionsStartDate)) / (1000 * 60 * 60 * 24));

    const incomeToDate = playerData.financeSummary.income || 0;
    const mandatorySpendingToDate = playerData.financeSummary.expensesByCategory?.[categories.mandatory]  || 0;
    const supplementarySpendingToDate = playerData.financeSummary.expensesByCategory?.[categories.supplementary] || 0;

    const discretionarySpendingToDate_Growth = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][0]]
    const discretionarySpendingToDate_Wants = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][1]]
    const discretionarySpendingToDate_Needs = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][2]]
    const discretionarySpendingToDate_Unallocated = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][3]]
        // Adjusted 
        const discretionarySpendingToDate_ADJ_Growth = discretionarySpendingToDate_Growth + (discretionarySpendingToDate_Unallocated * 0.2)
        const discretionarySpendingToDate_ADJ_Wants = discretionarySpendingToDate_Wants + (discretionarySpendingToDate_Unallocated * 0.3)
        const discretionarySpendingToDate_ADJ_Needs = discretionarySpendingToDate_Needs + (discretionarySpendingToDate_Unallocated * 0.5)
    
    // Function output variables - Averages
    dAvgIncome = incomeToDate / daysSinceFirstTransaction
    dAvgSpending_Mandatory = mandatorySpendingToDate / daysSinceFirstTransaction
    dAvgSpending_Supplementary = supplementarySpendingToDate / daysSinceFirstTransaction   
    dAvgSpending_Discretionary_Growth = discretionarySpendingToDate_ADJ_Growth / daysSinceFirstTransaction
    dAvgSpending_Discretionary_Wants = discretionarySpendingToDate_ADJ_Wants / daysSinceFirstTransaction 
    dAvgSpending_Discretionary_Needs = discretionarySpendingToDate_ADJ_Needs / daysSinceFirstTransaction  
    dAvgSpending_Discretionary = dAvgSpending_Discretionary_Growth + dAvgSpending_Discretionary_Wants + dAvgSpending_Discretionary_Needs  
    

    let cashflowData = { 
                            dAvgIncome, 
                            dAvgSpending_Mandatory, 
                            dAvgSpending_Supplementary,
                            dAvgSpending_Discretionary,
                            dAvgSpending_Discretionary_Growth,
                            dAvgSpending_Discretionary_Wants,
                            dAvgSpending_Discretionary_Needs 
                        }

    window.localStorage.setItem('cashflowData', JSON.stringify(cashflowData))
    cashflowData = JSON.parse(localStorage.getItem('cashflowData'))
    console.log(cashflowData)

    return cashflowData 

    // Store the finance summary in Firestore

    //await setDoc(userDocRef, playerData, { merge: true });
}

export async function getDiscretionaryData(cashflowDataInput = null, playerDataInput = null) {

    // Initialise Variables
    let dContributionsTarget_Avatar = null
    let dContributionsTarget_Community = null
    let dContributionsTarget_IGC = null
    let dSpendingCap_Growth = null
    let dSpendingCap_Wants = null
    let dSpendingCap_Needs = null
    let totalAccumulatedResource_Growth = null
    let totalAccumulatedResource_Wants = null
    let totalAccumulatedResource_Needs = null
    let availableResource_Growth = null
    let availableResource_Wants = null
    let availableResource_Needs = null
    let availableResource_Total = null
    let storedDays_Growth = null
    let storedDays_Wants = null
    let storedDays_Needs = null

    const growthAllocation = 0.2
    const wantsAllocation = 0.3
    const needsAllocation = 0.5 

    // Get Local Storage Variables
    const playerData = playerDataInput ?  playerDataInput : JSON.parse(localStorage.getItem('playerData'))
    const cashflowData = cashflowDataInput ?  cashflowDataInput : JSON.parse(localStorage.getItem('cashflowData'))
    
    // Retreive PlayerData variables
    let availableTransactionStartDate = null
        if (playerData.financeSummary.transactionStartDate){
            const [day, month, year] = playerData.financeSummary.transactionStartDate.split("/");
            availableTransactionStartDate = new Date(`${year}-${month}-${day}`);  
        } else {
            availableTransactionStartDate = playerData.startDate ? playerData.startDate.toDate() : null;
            if (!availableTransactionStartDate) {
                console.error("Start date is missing!");
                return;
            }
        }

    const transactionsStartDate = availableTransactionStartDate    
    const daysSinceFirstTransaction = parseFloat((new Date() - new Date(transactionsStartDate)) / (1000 * 60 * 60 * 24));
    
    const discretionarySpendingToDate_Growth = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][0]]
    const discretionarySpendingToDate_Wants = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][1]]
    const discretionarySpendingToDate_Needs = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][2]]
    const discretionarySpendingToDate_Unallocated = playerData.financeSummary.expensesByCategory?.[categories.discretionary][subCategories[categories.discretionary][3]]
        // Adjusted 
        const discretionarySpendingToDate_ADJ_Growth = discretionarySpendingToDate_Growth + (discretionarySpendingToDate_Unallocated * 0.2)
        const discretionarySpendingToDate_ADJ_Wants = discretionarySpendingToDate_Wants + (discretionarySpendingToDate_Unallocated * 0.3)
        const discretionarySpendingToDate_ADJ_Needs = discretionarySpendingToDate_Needs + (discretionarySpendingToDate_Unallocated * 0.5)
    
    // Retreive CashflowData variables
    const dAvgIncome = cashflowData.dAvgIncome
    const dAvgSpending_Mandatory = cashflowData.dAvgSpending_Mandatory
    const dAvgSpending_Supplementary = cashflowData.dAvgSpending_Supplementary

    // Function output variables
    const discretionaryPool = dAvgIncome - dAvgSpending_Mandatory - dAvgSpending_Supplementary
    dContributionsTarget_Avatar = (60 / 30.44) + (discretionaryPool * 0.075) || 0;
    dContributionsTarget_Community = (discretionaryPool * 0.025) || 0;
    dContributionsTarget_IGC = (discretionaryPool * 0.2) || 0;

    const personalDiscretionaryPool = discretionaryPool - (dContributionsTarget_Avatar + dContributionsTarget_Community + dContributionsTarget_IGC)  
    dSpendingCap_Growth = personalDiscretionaryPool * growthAllocation
    dSpendingCap_Wants = personalDiscretionaryPool * wantsAllocation
    dSpendingCap_Needs = personalDiscretionaryPool * needsAllocation    
    
    totalAccumulatedResource_Growth = dSpendingCap_Growth + (dSpendingCap_Growth * daysSinceFirstTransaction) - discretionarySpendingToDate_ADJ_Growth
    totalAccumulatedResource_Wants = dSpendingCap_Wants + (dSpendingCap_Wants * daysSinceFirstTransaction) - discretionarySpendingToDate_ADJ_Wants
    totalAccumulatedResource_Needs = dSpendingCap_Needs + (dSpendingCap_Needs * daysSinceFirstTransaction) - discretionarySpendingToDate_ADJ_Needs  
    
    availableResource_Growth = Math.abs(totalAccumulatedResource_Growth % dSpendingCap_Growth)
    availableResource_Wants = Math.abs(totalAccumulatedResource_Wants % dSpendingCap_Wants)
    availableResource_Needs = Math.abs(totalAccumulatedResource_Needs % dSpendingCap_Needs)
    availableResource_Total = availableResource_Growth + availableResource_Wants + availableResource_Needs

    storedDays_Growth = parseInt(totalAccumulatedResource_Growth / dSpendingCap_Growth)
    storedDays_Wants = parseInt(totalAccumulatedResource_Wants / dSpendingCap_Wants)
    storedDays_Needs = parseInt(totalAccumulatedResource_Needs / dSpendingCap_Needs)

    let discretionaryData = { 
        dContributionsTarget_Avatar, 
        dContributionsTarget_Community,
        dContributionsTarget_IGC,
        dSpendingCap_Growth, 
        dSpendingCap_Wants,
        dSpendingCap_Needs,
        totalAccumulatedResource_Growth,
        totalAccumulatedResource_Wants,
        totalAccumulatedResource_Needs,
        availableResource_Growth,
        availableResource_Wants,
        availableResource_Needs,
        availableResource_Total,
        storedDays_Growth,
        storedDays_Wants,
        storedDays_Needs
    }

    window.localStorage.setItem('discretionaryData', JSON.stringify(discretionaryData))
    discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'))
    console.log(discretionaryData)

    return discretionaryData 

    // Store the finance summary in Firestore
    //await setDoc(userDocRef, playerData, { merge: true });
}

export async function getAvatarData(discretionaryDataInput = null, playerDataInput = null) {

    // Get Local Storage Variables
    const playerData = playerDataInput ?  playerDataInput : JSON.parse(localStorage.getItem('playerData'))
    const discretionaryData = discretionaryDataInput ?  discretionaryDataInput : JSON.parse(localStorage.getItem('discretionaryData'))
 
    let contributionResults = {};
    
        const monthsSinceStart = playerData.monthsSinceStart
        const dailyTargetContribution = discretionaryData.dContributionsTarget_Avatar ? discretionaryData.dContributionsTarget_Avatar : 1
        console.log(discretionaryData.dContributionsTarget_Avatar)
        console.log(dailyTargetContribution)
        const totalContributed_Avatar = playerData.avatarData.avatarContribution ? playerData.avatarData.avatarContribution : 0;
       

        const maxContribution_Avatar = dailyTargetContribution * 30.44 * monthsSinceStart
        const contributionPercent_Avatar = Math.max(Math.min(totalContributed_Avatar / maxContribution_Avatar, 1.5),0)

        const contributionLevel = Math.min(1 + parseInt(totalContributed_Avatar / (dailyTargetContribution * 30.44)), 6 + parseInt(maxContribution_Avatar / (dailyTargetContribution * 30.44)))
        console.log(parseInt(totalContributed_Avatar / (dailyTargetContribution * 30.44)))
        console.log(parseInt(totalContributed_Avatar / (dailyTargetContribution * 30.44)))
        const contributionAmountToNextLevel = (dailyTargetContribution * 30.44) - totalContributed_Avatar % (dailyTargetContribution * 30.44)
        
  
  
        contributionResults = {
            maxContribution_Avatar: Math.round(maxContribution_Avatar),
            contributionPercent_Avatar: contributionPercent_Avatar,
            contributionLevel: contributionLevel,
            contributionAmountToNextLevel: contributionAmountToNextLevel,
        };
    

    // After building discretionaryResults dynamically (like we did before):
    window.localStorage.setItem('avatarData', JSON.stringify(contributionResults));
    const contributionyBreakdownData = JSON.parse(localStorage.getItem('avatarData'))
    console.log(contributionyBreakdownData)
    return contributionyBreakdownData

    // Store the finance summary in Firestore

    //await setDoc(userDocRef, playerData, { merge: true });
}

export function getAvatarStatData(baseAvatarData){

    // Get Local Storage Variables
    const discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'))

    let total = baseAvatarData.health.base

    baseAvatarData.health.empower = baseAvatarData.health.base * 0.5

    total += baseAvatarData.health.empower

    let hudMultiplier = 1 + (discretionaryData.storedDays_Growth * 0.01)

    total *= hudMultiplier

    if (total < baseAvatarData.health.base + baseAvatarData.health.empower){
        baseAvatarData.health.hud = 0
    } else {
        baseAvatarData.health.hud = total - (baseAvatarData.health.base + baseAvatarData.health.empower)
    }

    // Mana
    total = baseAvatarData.mana.base

    baseAvatarData.mana.empower = baseAvatarData.mana.base * 0.5

    total += baseAvatarData.mana.empower

    hudMultiplier = 1 + (discretionaryData.storedDays_Wants * 0.01)

    total *= hudMultiplier

    if (total < baseAvatarData.mana.base + baseAvatarData.mana.empower){
        baseAvatarData.mana.hud = 0
    } else {
        baseAvatarData.mana.hud = total - (baseAvatarData.mana.base + baseAvatarData.mana.empower)
    }

    // Stamina
    total = baseAvatarData.stamina.base

    baseAvatarData.stamina.empower = baseAvatarData.stamina.base * 0.5

    total += baseAvatarData.stamina.empower
    console.log(total)

    hudMultiplier = 1.35//1 + (discretionaryData.storedDays_Needs * 0.01)

    total *= hudMultiplier

    if (total < baseAvatarData.stamina.base + baseAvatarData.stamina.empower){
        baseAvatarData.stamina.hud = 0
    } else {
        baseAvatarData.stamina.hud = total - (baseAvatarData.stamina.base + baseAvatarData.stamina.empower)
    }


    return baseAvatarData
}





