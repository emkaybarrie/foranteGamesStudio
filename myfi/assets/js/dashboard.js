import { auth, db } from './auth.js';
import { getDoc, doc, setDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { logoutUser } from './auth.js';
import { categories, subCategories, incomeCategory, unallocatedRefName } from './config.js';
import { gapiLoaded, gisLoaded, extractSheetId, validateSheet, fetchSheetData, openGooglePicker  } from "./api.js";
import playerDataManager from "./playerDataManager.js";


import { getCashflowData,getDiscretionaryData, getAvatarData  } from './calculations.js';  
import { renderHUD, renderAvatarStats, renderDashboard, showManualEntryButton, hideManualEntryButton,showLinkAccountButton, 
    hideLinkAccountButton, hideUnlinkAccountButton , showUnlinkAccountButton, startLiveHUDUpdate, openPaymentModal, 
    openLinkSheetModal, closeSheetModal, showTooltip, hideTooltip,updateTooltipPosition,
    submitPayment, renderPlayerStats} from './ui.js';

const DataManager = {
  data: {},
  
  load() {
    const local = localStorage.getItem("gameData");
    this.data = local ? JSON.parse(local) : {};
    // Optional fallback from Firestore
  },

  get(key) {
    return this.data[key];
  },

  set(key, value) {
    this.data[key] = value;
    localStorage.setItem("gameData", JSON.stringify(this.data));
  },

  bulkSet(obj) {
    Object.assign(this.data, obj);
    localStorage.setItem("gameData", JSON.stringify(this.data));
  },

  syncToFirestore() {
    saveToFirestore(this.data);
  }
};

// Tooltips

// Add event listeners for elements with 'tooltip-target' class
// const tooltipElements = document.querySelectorAll('.tooltip-target');
// tooltipElements.forEach(element => {
//   element.addEventListener('mouseover', showTooltip);
//   element.addEventListener('mousemove', updateTooltipPosition); // Update tooltip position as cursor moves
//   element.addEventListener('mouseout', hideTooltip);
// });

// Utility: poll until the given checkFn returns true
function waitForLibrary(name, checkFn) {
    return new Promise(resolve => {
      (function poll() {
        if (checkFn()) return resolve();
        setTimeout(poll, 50);
      })();
    });
  }
  
  // Bootstrap Google APIs on DOM ready
  async function initGoogleStuff() {
    // 1) Wait for GAPI (api.js) to load
    await waitForLibrary('gapi', () => window.gapi && gapi.load);
    gapiLoaded();
  
    // 2) Wait for GIS library
    await waitForLibrary('gis', () => window.google?.accounts?.oauth2);
    gisLoaded();
  }
  
  window.addEventListener('DOMContentLoaded', initGoogleStuff);

  // Google Picker


window.addEventListener('DOMContentLoaded', async () => {
    await waitForLibrary('gapi', () => window.gapi?.load);
    gapiLoaded();
  
    await waitForLibrary('gis', () => window.google?.accounts?.oauth2);
    gisLoaded();
  });

  
// Link/Unlink Sheet Modal
document.addEventListener('DOMContentLoaded', () => {
    const linksheetBtn = document.getElementById('link-sheet-btn');
    ; // or pass a specific amount if you like
    if (linksheetBtn) linksheetBtn.addEventListener('click', () => { openLinkSheetModal()});
  });
  // Close Modal
document.addEventListener('DOMContentLoaded', () => {
    const linksheetBtn = document.getElementById('cancel-btn');
    ; // or pass a specific amount if you like
    if (linksheetBtn) linksheetBtn.addEventListener('click', () => { closeSheetModal()});
  });

  document.addEventListener('DOMContentLoaded', () => {
    const linksheetBtn = document.getElementById('unlink-sheet-btn');
    ; // or pass a specific amount if you like
    if (linksheetBtn) linksheetBtn.addEventListener('click', () => { unlinkSheet()});
  });

  document.addEventListener('DOMContentLoaded', () => {
    const linksheetBtn = document.getElementById('refresh-link-sheet-btn');
    ; // or pass a specific amount if you like
    if (linksheetBtn) linksheetBtn.addEventListener('click', () => { openGooglePicker()});
  });

  // --- Manual link handler ---
const confirmBtn  = document.getElementById('confirm-btn');
const sheetLinkIn = document.getElementById('sheet-link');

confirmBtn.addEventListener('click', async () => {
    const raw     = sheetLinkIn.value.trim();
    const sheetId = extractSheetId(raw);
    if (!sheetId) {
      return alert('Invalid Google Sheets URL.');
    }
  
    // 1) Save the sheetId
    const user = JSON.parse(localStorage.getItem('user'));
    await setDoc(doc(db, 'players', user.uid), { sheetId }, { merge: true });
  
    // 2) Fetch & display row 2, using API→CSV fallback
    try {
      await fetchSheetData(sheetId);
      alert('✅ Sheet linked and row 2 fetched!');
    } catch (err) {
      console.error('Both OAuth and CSV fetch failed:', err);
      alert('❌ Could not load Sheet. Is it publicly shared?');
    }
  
    // 3) Close modal & signal link complete
    document.dispatchEvent(new Event('sheetLinked'));
  });

// --- Listen for row2Fetched to update preview ---
window.addEventListener('row2Fetched', e => {
  document.getElementById('preview-row2').innerText =
    JSON.stringify(e.detail, null, 2);
});

document.addEventListener('sheetLinked', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const link = `https://docs.google.com/spreadsheets/d/${user.sheetId}`;
    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open linked Sheet';
    openBtn.onclick = () => window.open(link, '_blank');
    document.body.appendChild(openBtn);
  });


// Core Code 

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
       
    } else {
        window.localStorage.setItem('user', JSON.stringify(user));
        
        const userRef = doc(db, 'players', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            const startDate = new Date();
            await setDoc(userRef, { startDate: startDate }, { merge: true });
        }

        await playerDataManager.init(user.uid).then((player) => {
      console.log("Player data loaded:", player);
    });
       
        fetchDataAndRenderMyFiDashboard(user.uid);

        
       
       
    }
});

// Logout and Manual Entry button setup
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    const manualBtn = document.getElementById('manual-entry-btn');

    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    if (manualBtn) manualBtn.addEventListener('click', () => {
        window.location.href = 'manual-entry.html';
    });
});

// Global functions to open and close modal


// document.addEventListener('DOMContentLoaded', () => {
//     console.log("Document loaded");

//     // OPEN MODAL
//     const openBtns = document.querySelectorAll('.action-btn');
//     openBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             const modal = document.getElementById('payment-modal');
//             modal.classList.remove('hidden');
//             modal.style.opacity = 1;
//             modal.style.visibility = 'visible';

//             // Clear QR code when modal opens
//             const qrDiv = document.getElementById('qrCode');
//             qrDiv.innerHTML = ""; // Clear any existing QR code
//         });
//     });

//     // CLOSE MODAL on Close Button
//     const closeBtn = document.getElementById('close-btn');
//     closeBtn.addEventListener('click', () => {
//         const modal = document.getElementById('modal');
//         modal.style.opacity = 0;
//         modal.style.visibility = 'hidden';
//         const amountField = document.getElementById('amount');
//     amountField.value = ''; // Reset value on close
//         setTimeout(() => {
//             modal.classList.add('hidden');
//         }, 300); // Wait for opacity transition to complete
//     });

//     // GENERATE QR
//     const generateBtn = document.getElementById('generate-btn');
//     if (generateBtn) {
//         console.log("Generate QR button found");

//         generateBtn.addEventListener('click', (e) => {
//             console.log("Generate QR button clicked");

//             // Prevent this click from propagating up to the modal close event
//             e.stopPropagation();

//             const amount = document.getElementById('amount').value;
//             const method = document.getElementById('paymentMethod').value;
//             const qrDiv = document.getElementById('qrCode');

//             // Clear any previous QR code
//             qrDiv.innerHTML = "";
//             console.log("Amount:", amount);
//             console.log("Payment Method:", method);

//             let qrText = "";

//             if (amount && !isNaN(amount) && amount > 0) {
//                 console.log("Amount provided:", amount);
//                 if (method === "monzo") {
//                     qrText = `https://monzo.me/emkaybarrie/${amount}`;
//                 } else if (method === "bank") {
//                     qrText = "Bank Transfer (Coming Soon)";
//                 } else if (method === "crypto") {
//                     qrText = "Crypto (Coming Soon)";
//                 } else {
//                     qrText = "Invalid Payment Method";
//                 }

//                 // Generate QR Code only if qrText is valid
//                 if (qrText) {
//                     console.log("Generating QR Code with text:", qrText);
//                     new QRCode(qrDiv, {
//                         text: qrText,
//                         width: 128,
//                         height: 128
//                     });
//                 }
//             } else {
//                 qrText = "Please enter a valid amount.";
//                 qrDiv.innerHTML = qrText; // Display message if no valid amount is provided
//                 console.log("Invalid or missing amount");
//             }
//         });
//     } else {
//         console.error("Generate QR button not found");
//     }
// });

// Profile 
// Button Listeners
// document.addEventListener('DOMContentLoaded', () => {
//     const empowerBtn = document.getElementById('submit-payment');
//     //const discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'))
//     // or pass a specific amount if you like
//     if (empowerBtn) empowerBtn.addEventListener('click', () => { submitPayment(
//     )});
//   })
// Community Contributions
document.addEventListener('DOMContentLoaded', () => {
    const sendContributionBtn = document.getElementById('send-contribution-btn');
    const discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'))
    // or pass a specific amount if you like
    if (sendContributionBtn) sendContributionBtn.addEventListener('click', () => { openPaymentModal(Math.round(discretionaryData.dContributionsTarget_Community)
    )});
  });
// IGC Purchases
  document.addEventListener('DOMContentLoaded', () => {
    const sendContributionBtn = document.getElementById('purchase-igc-btn');
    const discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'))
    // or pass a specific amount if you like
    if (sendContributionBtn) sendContributionBtn.addEventListener('click', () => { openPaymentModal(Math.round(discretionaryData.dContributionsTarget_IGC)
    )});
  });
// Enter The Badlands
document.addEventListener('DOMContentLoaded', () => {
    const enterBadlandsBtn = document.getElementById('enter-badlands-btn');
    if (enterBadlandsBtn) enterBadlandsBtn.addEventListener('click', () => { window.open('https://emkaybarrie.github.io/foranteGamesStudio/badlands/', '_blank')});
  });

  const paymentMethodSelect = document.getElementById('paymentMethod');
  const paymentDetailsDiv = document.getElementById('paymentDetails');
  const qrCodeDiv = document.getElementById('qrCode');


  const paymentInfo = {
    monzo: {
      label: "Pay via Monzo.Me",
      link: "https://monzo.me/emkaybarrie?amount=10.00&d=Reference+Test"
    },
    bank: {
      label: "Bank Transfer: Sort 12-34-56 Acc 12345678",
      link: "SortCode:123456;AccNo:12345678"
    },
    paypal: {
      label: "Pay via PayPal",
      link: "https://paypal.me/emkaybarrie@gmail.com/5"
    },
    crypto: {
      label: "Send USDC to wallet address below",
      link: "0xYourEthereumWalletAddressHere"
    }
  };

  const qr = new QRious({
    element: document.createElement('canvas'),
    size: 200,
    value: ''
  });

  paymentMethodSelect.addEventListener('change', (e) => {
    const method = e.target.value;
    const { label, link } = paymentInfo[method];

    paymentDetailsDiv.innerText = label;

    // Update QR code value
    qr.value = link;

    // Clear and re-add QR
    qrCodeDiv.innerHTML = '';
    qrCodeDiv.appendChild(qr.element);

    const submit = document.getElementById('submit-payment');
    if (submit) submit.style.display = 'block';
    const qrHeader = document.getElementById('qrHeader');
    if (qrHeader) qrHeader.style.display = 'block';

  });


document.getElementById('close-payment-modal').addEventListener('click', () => {
    document.getElementById('payment-modal').style.display = 'none';
    const qrHeader = document.getElementById('qrHeader');
    if (qrHeader) qrHeader.style.display = 'none';
  });

// document.addEventListener('DOMContentLoaded', () => {
//     const paymentModal = document.getElementById('payment-modal');
//     const sheetsModal = document.getElementById('sheets-modal');
//     const openPickerBtn = document.getElementById('open-picker-btn');
//     const cancelBtn = document.getElementById('cancel-btn');
//     const confirmBtn = document.getElementById('confirm-btn');
//     const sheetLinkInput = document.getElementById('sheet-link');
//     const closeBtn = document.getElementById('close-btn');

//     // --- Modal Helpers ---

//     function openModal(modal) {
//         modal.classList.remove('hidden');
//         modal.style.opacity = 1;
//         modal.style.visibility = 'visible';
//     }

//     function closeModal(modal) {
//         modal.style.opacity = 0;
//         modal.style.visibility = 'hidden';
//         setTimeout(() => {
//             modal.classList.add('hidden');
//         }, 300);
//     }



//     // --- Event Listeners ---

//     // Open Google Picker when button clicked
//     openPickerBtn.addEventListener('click', openGooglePicker);

//     // Cancel button inside Sheets modal
//     cancelBtn.addEventListener('click', () => closeModal(sheetsModal));

//     // Close button inside Payment modal
//     closeBtn.addEventListener('click', () => closeModal(paymentModal));

export async function fetchDataAndRenderMyFiDashboard(uid) {
    const userDocRef = doc(db, "players", uid); // Temp
    const playerData = await getPlayerData()
    console.log("Player data from Firestore:", playerData);

    if (playerData.alias && playerData.startBalance !== undefined) {
                
                // ✅ Handle startDate
                let startDate = null
                if (playerData.financeSummary.transactionStartDate){
                    startDate = playerData.financeSummary.transactionStartDate
                    

                    const [day, month, year] = startDate.split("/");
                    startDate = new Date(`${year}-${month}-${day}`);
                 
                    
                } else {
                    startDate = playerData.startDate ? playerData.startDate.toDate() : null;
                    if (!startDate) {
                        console.error("Start date is missing!");
                        return;
                    }
                }

            
                const monthsSinceStart = parseFloat((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30.44));


                await setDoc(userDocRef, { monthsSinceStart: monthsSinceStart }, { merge: true });

                if (playerData.sheetId) {
                    
                    console.log("Linked Account Detected.  Importing Transaction Data...")
            
                    loadTransactionData(playerData.sheetId);

                    hideManualEntryButton();
                    hideLinkAccountButton();

                    showUnlinkAccountButton();
                } else {
                    console.log("No Linked Account Detected.  Activating Manual Entry Mode...")
                    showManualEntryButton();
                    showLinkAccountButton();
                    hideUnlinkAccountButton();
                }

                if (playerData) {
                    saveToLocalStorage('alias', playerData.alias)
                    console.log("Storing playerData components to Local Storage:" )
                    console.log('Finance Data...', playerData.financeSummary )
                    saveToLocalStorage('finanaceData', playerData.financeSummary)
                    console.log('Avatar Data...', playerData.avatarData)
                    saveToLocalStorage('avatarData', playerData.avatarData)
                    saveToLocalStorage('attributeData', playerData.attributePoints)

                    // Calculate
                    const cashflowData = await getCashflowData(playerData)
                    const discretionaryData = await getDiscretionaryData(cashflowData, playerData)
                    const avatarData = await getAvatarData(discretionaryData, playerData)

                    saveAvatarDataToFireStore(avatarData)
               
                   
                    
                    
     

                    // Render
                    renderDashboard(playerData);
                    renderPlayerStats(playerData)
                    renderHUD(discretionaryData)
                    
                    renderAvatarStats();
                
                    //startLiveHUDUpdate(discretionaryData)

                    const ctx = document.getElementById('metricsChart').getContext('2d');

                    const metricsChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Income', 'Mandatory', 'Supplementary', 'Discretionary'],
                            datasets: [{
                                label: 'Average Daily Totals',
                                data: [cashflowData.dAvgIncome, cashflowData.dAvgSpending_Mandatory, cashflowData.dAvgSpending_Supplementary, cashflowData.dAvgSpending_Discretionary],
                                backgroundColor: [
                                    '#6200ea',
                                    '#bb86fc',
                                    '#985eff',
                                    '#7f39fb',
                                    '#3700b3'
                                ],
                                borderRadius: 6
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false, // Let the parent container control size
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { color: '#ccc' },
                                    grid: { color: '#444' }
                                },
                                x: {
                                    ticks: { color: '#ccc' },
                                    grid: { color: '#444' }
                                }
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#ccc'
                                    }
                                }
                            },
                            animation: {
                                duration: 2000, // milliseconds
                                easing: 'easeOutBounce' // other options: 'linear', 'easeInOutQuart', etc.
                            },
                        }
                    });

                    const ctx2 = document.getElementById('metricsChart2').getContext('2d');

                    const metricsChart2 = new Chart(ctx2, {
                        type: 'line',
                        data: {
                            labels: ['Day 1', 'Day 3', 'Day 5', 'Day 7'],
                            datasets: [{
                                label: 'Daily Spending',
                                data: [cashflowData.dAvgIncome, cashflowData.dAvgSpending_Mandatory, cashflowData.dAvgSpending_Supplementary, cashflowData.dAvgSpending_Discretionary],
                                backgroundColor: [
                                    '#6200ea',
                                    '#bb86fc',
                                    '#985eff',
                                    '#7f39fb',
                                    '#3700b3'
                                ],
                                borderRadius: 6
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false, // Let the parent container control size
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { color: '#ccc' },
                                    grid: { color: '#444' }
                                },
                                x: {
                                    ticks: { color: '#ccc' },
                                    grid: { color: '#444' }
                                }
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        color: '#ccc'
                                    }
                                }
                            },
                            animation: {
                                duration: 2000, // milliseconds
                                easing: 'easeOutBounce' // other options: 'linear', 'easeInOutQuart', etc.
                            },
                        }
                    });

                }

    } else {
        console.error("Alias or balance missing.");
        //window.location.href = 'login.html';
    }

    // const userDocRef = doc(db, "players", uid);

    // try {
    //     const userDoc = await getDoc(userDocRef);
    //     if (userDoc.exists()) {
    //         const playerData = userDoc.data();
    //         console.log("Player data from Firestore:", playerData);
            

    //         if (playerData.alias && playerData.startBalance !== undefined) {
                
    //             // ✅ Handle startDate
    //             let startDate = null
    //             if (playerData.financeSummary.transactionStartDate){
    //                 startDate = playerData.financeSummary.transactionStartDate
                    

    //                 const [day, month, year] = startDate.split("/");
    //                 startDate = new Date(`${year}-${month}-${day}`);
                 
                    
    //             } else {
    //                 startDate = playerData.startDate ? playerData.startDate.toDate() : null;
    //                 if (!startDate) {
    //                     console.error("Start date is missing!");
    //                     return;
    //                 }
    //             }

            
    //             const monthsSinceStart = parseFloat((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30.44));


    //             await setDoc(userDocRef, { monthsSinceStart: monthsSinceStart }, { merge: true });

    //             if (playerData.sheetId) {
                    
    //                 console.log("Linked Account Detected.  Importing Transaction Data...")
            
    //                 loadTransactionData(playerData.sheetId);

    //                 hideManualEntryButton();
    //                 hideLinkAccountButton();

    //                 showUnlinkAccountButton();
    //             } else {
    //                 console.log("No Linked Account Detected.  Activating Manual Entry Mode...")
    //                 showManualEntryButton();
    //                 showLinkAccountButton();
    //                 hideUnlinkAccountButton();
    //             }

    //             if (playerData) {
    //                 console.log("Storing playerData components to Local Storage:" )
    //                 console.log('Finance Data...', playerData.financeSummary )
    //                 saveToLocalStorage('finanaceData', playerData.financeSummary)
    //                 console.log('Avatar Data...', playerData.avatarData)
    //                 saveToLocalStorage('avatarData', playerData.avatarData)
    //                 saveToLocalStorage('attributeData', playerData.attributePoints)

    //                 // Calculate
    //                 const cashflowData = await getCashflowData(playerData)
    //                 const discretionaryData = await getDiscretionaryData(cashflowData, playerData)
    //                 const avatarData = await getAvatarData(discretionaryData, playerData)

    //                 saveAvatarDataToFireStore(avatarData)
               
                   
                    
                    
     

    //                 // Render
    //                 renderDashboard(playerData);
    //                 renderPlayerStats(playerData)
    //                 renderHUD(discretionaryData)
                    
    //                 renderAvatarStats();
                
    //                 //startLiveHUDUpdate(discretionaryData)

    //                 const ctx = document.getElementById('metricsChart').getContext('2d');

    //                 const metricsChart = new Chart(ctx, {
    //                     type: 'bar',
    //                     data: {
    //                         labels: ['Income', 'Mandatory', 'Supplementary', 'Discretionary'],
    //                         datasets: [{
    //                             label: 'Average Daily Totals',
    //                             data: [cashflowData.dAvgIncome, cashflowData.dAvgSpending_Mandatory, cashflowData.dAvgSpending_Supplementary, cashflowData.dAvgSpending_Discretionary],
    //                             backgroundColor: [
    //                                 '#6200ea',
    //                                 '#bb86fc',
    //                                 '#985eff',
    //                                 '#7f39fb',
    //                                 '#3700b3'
    //                             ],
    //                             borderRadius: 6
    //                         }]
    //                     },
    //                     options: {
    //                         responsive: true,
    //                         maintainAspectRatio: false, // Let the parent container control size
    //                         scales: {
    //                             y: {
    //                                 beginAtZero: true,
    //                                 ticks: { color: '#ccc' },
    //                                 grid: { color: '#444' }
    //                             },
    //                             x: {
    //                                 ticks: { color: '#ccc' },
    //                                 grid: { color: '#444' }
    //                             }
    //                         },
    //                         plugins: {
    //                             legend: {
    //                                 labels: {
    //                                     color: '#ccc'
    //                                 }
    //                             }
    //                         },
    //                         animation: {
    //                             duration: 2000, // milliseconds
    //                             easing: 'easeOutBounce' // other options: 'linear', 'easeInOutQuart', etc.
    //                         },
    //                     }
    //                 });

    //                 const ctx2 = document.getElementById('metricsChart2').getContext('2d');

    //                 const metricsChart2 = new Chart(ctx2, {
    //                     type: 'line',
    //                     data: {
    //                         labels: ['Day 1', 'Day 3', 'Day 5', 'Day 7'],
    //                         datasets: [{
    //                             label: 'Daily Spending',
    //                             data: [cashflowData.dAvgIncome, cashflowData.dAvgSpending_Mandatory, cashflowData.dAvgSpending_Supplementary, cashflowData.dAvgSpending_Discretionary],
    //                             backgroundColor: [
    //                                 '#6200ea',
    //                                 '#bb86fc',
    //                                 '#985eff',
    //                                 '#7f39fb',
    //                                 '#3700b3'
    //                             ],
    //                             borderRadius: 6
    //                         }]
    //                     },
    //                     options: {
    //                         responsive: true,
    //                         maintainAspectRatio: false, // Let the parent container control size
    //                         scales: {
    //                             y: {
    //                                 beginAtZero: true,
    //                                 ticks: { color: '#ccc' },
    //                                 grid: { color: '#444' }
    //                             },
    //                             x: {
    //                                 ticks: { color: '#ccc' },
    //                                 grid: { color: '#444' }
    //                             }
    //                         },
    //                         plugins: {
    //                             legend: {
    //                                 labels: {
    //                                     color: '#ccc'
    //                                 }
    //                             }
    //                         },
    //                         animation: {
    //                             duration: 2000, // milliseconds
    //                             easing: 'easeOutBounce' // other options: 'linear', 'easeInOutQuart', etc.
    //                         },
    //                     }
    //                 });

    //             }

    //         } else {
    //             console.error("Alias or balance missing.");
    //             window.location.href = 'login.html';
    //         }
    //     } else {
    //         console.error("No document found.");
    //         window.location.href = 'login.html';
    //     }
    // } catch (error) {
    //     console.error("Error fetching Firestore document:", error);
    // }
}

export function saveToLocalStorage(storageReference, value){
    window.localStorage.setItem(storageReference, JSON.stringify(value))
    return JSON.parse(localStorage.getItem(storageReference))
}

export function loadFromLocalStorage(storageReference){
    return JSON.parse(localStorage.getItem(storageReference))
}

export async function saveAvatarDataToFireStore(avatarDataInput = null){
    const avatarData = avatarDataInput ?  avatarDataInput : loadFromLocalStorage('avatarData')
    
    console.log("Data to Save to Attributes: ", avatarData )

    const user = JSON.parse(localStorage.getItem('user'));
    const playerRef = doc(db, 'players', user.uid);

    try {
    await setDoc(playerRef, {
    avatarData: avatarData
    }, { merge: true });

    window.localStorage.setItem('avatarData', avatarData)

    const user = JSON.parse(localStorage.getItem('user'));
    //fetchDataAndRenderMyFiDashboard(user.uid)
    //alert("Your attributes have been saved!");
    } catch (err) {
    console.error("Error saving to Firestore:", err);
    //alert("There was an error saving your choices.");
    }
}

export async function getPlayerData(){ // Check local then fallback to DB
    const user = JSON.parse(localStorage.getItem('user'));
    const userRef = doc(db, 'players', user.uid);

    try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const playerData = userDoc.data();
      
            return playerData
            
        }
    } catch (error) {
        console.error("Error fetching Firestore document:", error);
    }
}

export async function saveAttributesToFirestore(attributeDataInput = null) {
    

    const attributeData = attributeDataInput ?  attributeDataInput : loadFromLocalStorage('attributeData')
    
    console.log("Data to Save to Attributes: ", attributeData )

    const confirmed = confirm("Are you sure you want to lock in your choices? This cannot be undone.");
    if (!confirmed) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const playerRef = doc(db, 'players', user.uid);

    try {
    await setDoc(playerRef, {
    attributePoints: attributeData
    }, { merge: true });

    window.localStorage.setItem('attributeData', attributeData)

    const user = JSON.parse(localStorage.getItem('user'));
    fetchDataAndRenderMyFiDashboard(user.uid)
    alert("Your attributes have been saved!");
    } catch (err) {
    console.error("Error saving to Firestore:", err);
    alert("There was an error saving your choices.");
    }
}

async function unlinkSheet() {
    const confirmed = confirm("Are you sure you want to unlink your Google Sheet?");
    if (!confirmed) return;

    const user = JSON.parse(window.localStorage.getItem('user'));
    if (!user || !user.uid) {
        alert("User not found or not logged in.");
        return;
    }

    const userDocRef = doc(db, "players", user.uid);

    try {
        await updateDoc(userDocRef, {
            sheetId: deleteField(),
            transactionStartDate: deleteField()

        });
        alert("Your Google Sheet has been successfully unlinked.");
    } catch (error) {
        console.error("Error unlinking Google Sheet:", error);
        alert("An error occurred while unlinking. Please try again.");
    }

    fetchDataAndRenderMyFiDashboard(user.uid)
}



// MOVE TO GGOGLE API FILE
    // Fetch Transactions from Google Sheets

// Fetch Transactions from Google Sheets
export async function loadTransactionData(storedDataSourceID = null) {
    //const storedDataSourceID = localStorage.getItem('transactionDataSourceID');
    const storedData = localStorage.getItem('transactionData');
      
        if (storedData) {
            // Parse the stored data
             const parsedData = JSON.parse(storedData);
             //console.log('Stored Data available', parsedData )
             if (Array.isArray(parsedData)) {
                const transactions = parsedData.slice(1).map(row => ({
                    date: row[1], // assuming column B is date
                    category: row[6], // assuming column G is category
                    amount: parseFloat(row[7]), // assuming column H is amount
                }));
    
            

                const { totalIncome, expensesByCategory, balance, transactionStartDate } = await processTransactions(transactions);
                await updateUserData(totalIncome, expensesByCategory, balance, transactionStartDate);


            } else {
                console.error('Data structure is not an array.');
            }

            
        } else {
            fetchSheetData(storedDataSourceID)
        }
  
}

// ✍️ Process and Store Transactions in Firestore
export async function processTransactions(transactions) {
    const user = JSON.parse(window.localStorage.getItem('user'));
    const userDocRef = doc(db, "players", user.uid);

    
    const transactionStartDate = "01/04/2025"//transactions[0].date - need to figure out either system to work well with first start date or sync to first day if month of  account opening date

    let expensesByCategory = {
        [categories.mandatory]: 0,
        [categories.supplementary]: 0,
        [categories.discretionary]: {},
    };

    // Initialize discretionary subcategories
    subCategories[categories.discretionary].forEach(subCat => {
        expensesByCategory[categories.discretionary][subCat] = 0;
    });

    let totalIncome = 0;
    let balance = 0
    const startDateStr = transactionStartDate
    const [day, month, year] = startDateStr.split('/');
    const monitoringStartDate = new Date(`${year}-${month}-${day}`); // Replace with your actual start date 

    transactions.forEach(transaction => {
        const dateStr = transaction.date
        const [day, month, year] = dateStr.split('/');
        const transactionDate = new Date(`${year}-${month}-${day}`); // Format to YYYY-MM-DD//new Date(transaction.date);

    
        if (transactionDate < monitoringStartDate) return; // Skip if after monitoring start

        if (transaction.amount > 0) {
            totalIncome += transaction.amount;
        } else {
            const category = transaction.category || unallocatedRefName;

            if (category === categories.mandatory) {
                expensesByCategory[categories.mandatory] += Math.abs(transaction.amount);
            } else if (category === categories.supplementary) {
                expensesByCategory[categories.supplementary] += Math.abs(transaction.amount);
            } else if (subCategories[categories.discretionary].includes(category)) {
                expensesByCategory[categories.discretionary][category] += Math.abs(transaction.amount);
            } else {
                expensesByCategory[categories.discretionary][unallocatedRefName] += Math.abs(transaction.amount);
            }
        }

        balance += transaction.amount
    });
    
    return { totalIncome, expensesByCategory, balance, transactionStartDate };

}

// Update user data in Firestore
export async function updateUserData(income, expenses, balance, transactionStartDate) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userDocRef = doc(db, "players", user.uid);
    const playerData = {
        financeSummary: { income, expensesByCategory: expenses, currentBalance: balance, transactionStartDate }
    };
    await setDoc(userDocRef, playerData, { merge: true });
    
}


        
        
        
        

        
        
