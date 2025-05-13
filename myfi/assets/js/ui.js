// ui.js
import { auth, db } from './auth.js';
import { getDoc, doc, setDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { categories, subCategories, incomeCategory } from './config.js';
import { fetchDataAndRenderMyFiDashboard } from './dashboard.js';


/* ========== Helpers ========== */

// Create HTML-safe ID from a name
function createIdFromName(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
}

// Smooth progress bar animation
function animateProgressBar(barElement, targetPercent, duration = 1000) {
    let start = null;
    const initialWidth = 0;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percent = Math.min(initialWidth + (progress / duration) * targetPercent, targetPercent);
        barElement.style.width = percent + '%';

        if (percent < targetPercent) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// Smooth amount animation
function animateAmount(labelElement, startAmount, endAmount, dailyCap, duration = 1000) {
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const currentAmount = Math.min(startAmount + (progress / duration) * (endAmount - startAmount), endAmount);

        labelElement.innerText = `£${currentAmount.toFixed(2)} / £${dailyCap.toFixed(2)}`;

        if (currentAmount < endAmount) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

/* ========== Displayed Information ========== */
// Predefined library of tooltip text, using the `id` as the key
const tooltipLibrary = {
    "contributions-bar-container": "Spend energy to your avatar, empowering them up to Rank 5 each day",
    'hud-upper-misc-left': "Stored Energy can be formed into Power Gems (and represent a month's worth of discretionary funds)",
    'hud-upper-misc-right': "Shows your total available energy for today, as well as total energy pool value (i.e actual balance)",
    tooltip3: "This is another custom tooltip message."
  };

  // Timer to delay the tooltip showing
let tooltipTimeout;
// Function to show the tooltip
// Function to show the tooltip
export function showTooltip(event) {
    const elementId = event.target.id;  // Get the element's id
    const tooltipText = tooltipLibrary[elementId]; // Use id to fetch tooltip text from the library
    
    if (tooltipText) {
      // Create tooltip element if it doesn't exist
      let tooltip = document.querySelector('.tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
      }
  
      // Set the tooltip text and position
      tooltip.textContent = tooltipText;

      

      //tooltip.classList.add('tooltip-visible');
      // Set a timeout to show the tooltip after a delay
        tooltipTimeout = setTimeout(() => {
            tooltip.classList.add('tooltip-visible');

            if(elementId == "contributions-bar-container"){
                tooltip.classList.add('glow'); // Add glow class conditionally
            } 
        }, 500); // Adjust the 500ms delay to your preference
      
      // Positioning the tooltip
      const rect = event.target.getBoundingClientRect();
      tooltip.style.left = rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 10 + 'px'; // Adjust the 10 for space above element





    }
  }

  // Function to update the tooltip's position based on the mouse position
export function updateTooltipPosition(event) {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip && tooltip.classList.contains('tooltip-visible')) {
      // Position the tooltip near the cursor
      tooltip.style.left = `${event.clientX + 10}px`;  // 10px offset from the cursor
      tooltip.style.top = `${event.clientY + 10}px`;  // 10px offset from the cursor
    }
  }
  
  // Function to hide the tooltip
export  function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        clearTimeout(tooltipTimeout); // Clear the delay if the mouse leaves before the tooltip appears
      tooltip.classList.remove('tooltip-visible');
      tooltip.classList.remove('glow');
    }
  }
  
  // Add event listeners for elements with 'tooltip-target' class
  const tooltipElements = document.querySelectorAll('.tooltip-target');
  tooltipElements.forEach(element => {
    element.addEventListener('mouseover', showTooltip);
    //element.addEventListener('mousemove', updateTooltipPosition); // Update tooltip position as cursor moves
    element.addEventListener('mouseout', hideTooltip);
  });
  

/* ========== Dashboard Renderer ========== */

export function renderDashboard(playerData) {
    document.getElementById('alias-banner').innerText = playerData.alias || 'No Alias';

    const discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'))
    const discretionaryBalanceElement = document.getElementById('discretionary-current-balance');
    discretionaryBalanceElement.innerText = discretionaryData.availableResource_Total !== undefined
        ? `£${discretionaryData.availableResource_Total.toFixed(2)}`
        : '£0.00';
    const balanceElement = document.getElementById('current-balance');
    balanceElement.innerText = playerData.financeSummary.currentBalance !== undefined
        ? `£${playerData.financeSummary.currentBalance.toFixed(2)}`
        : '£0.00';


    const avatarData = JSON.parse(localStorage.getItem('avatarData'))
    const avatarLevelElement = document.getElementById('profile-level');
    avatarLevelElement.innerText = avatarData.contributionLevel !== undefined
        ? `Lvl ${avatarData.contributionLevel.toFixed(0)}`
        : '0';

    const powerLevelElement = document.getElementById('power-level');
    powerLevelElement.innerText = avatarData.contributionPercent_Avatar !== undefined
    ? `${avatarData.contributionPercent_Avatar.toFixed(2) * 100}%`
    : '0';

    const powerTotalElement = document.getElementById('power-total');
    powerTotalElement.innerText = playerData.avatarData.avatarContribution !== undefined
    ? `${playerData.avatarData.avatarContribution.toFixed(0)}`
    : '0';

    const profilePic = document.getElementById('profile-picture');
    profilePic.style.backgroundImage = "url('./assets/img/default-profile.png')";

    if (playerData.profilePictureUrl) {
        profilePic.style.backgroundImage = `url('${playerData.profilePictureUrl}')`;
    }
}

/* ========== HUD Renderer ========== */

// Refresh Dashboard UI with latest player data
function refreshDashboard(playerData) {
    const aliasBanner = document.getElementById('alias-banner');
    const currentBalanceElement = document.getElementById('current-balance');
    const profilePic = document.getElementById('profile-picture');

    // Alias
    aliasBanner.innerText = playerData.alias || 'No Alias';

    // Current Balance
    currentBalanceElement.innerText = playerData.financeSummary.currentBalance !== undefined
        ? `Balance: £${playerData.financeSummary.currentBalance.toFixed(2)}`
        : 'Balance: £0.00';

    // Profile Picture (fallback to default if missing)
    profilePic.style.backgroundImage = playerData.profilePictureUrl 
        ? `url('${playerData.profilePictureUrl}')`
        : "url('./assets/img/default-profile.png')";
}


export async function renderHUD(discretionaryData) {
    const upperHudContainer_Vitals = document.getElementById('upper-hud-vitals');
    upperHudContainer_Vitals.innerHTML = "";

    subCategories[categories.discretionary].forEach(subCat => {
        if (subCat.toLowerCase() !== 'unallocated')  {
            
            const availableResource = discretionaryData[`availableResource_${subCat}`] ?? 0;
            const dSpendingCap = discretionaryData[`dSpendingCap_${subCat}`] ?? 1;
            const storedDays = discretionaryData[`storedDays_${subCat}`] ?? 0;

            // Use the variables as needed
            console.log(`${subCat}:`, { availableResource, dSpendingCap, storedDays });

            const percentage = Math.min((availableResource / dSpendingCap) * 100, 100);

            

            const barWrapper = document.createElement('div');
            barWrapper.className = 'bar-wrapper';

            const label = document.createElement('div');
            label.className = 'bar-label';
            label.innerText = `£0.00 / £${dSpendingCap.toFixed(2)}`;

            const barBackground = document.createElement('div');
            barBackground.className = 'bar-background';

            const barFill = document.createElement('div');
            barFill.className = `bar-fill ${subCat.toLowerCase()}`;
            barFill.style.width = `0%`;

            // Circle badge for stored days
            const circleBadge = document.createElement('div');
            circleBadge.className = 'circle-badge';
            circleBadge.innerText = `${Math.round(storedDays)}`;

            barBackground.append(barFill, circleBadge);
            barWrapper.append(label, barBackground);
            upperHudContainer_Vitals.append(subCat, barWrapper);

            // Animate
            animateProgressBar(barFill, percentage);
            animateAmount(label, 0, availableResource, dSpendingCap);

            if (percentage >= 90) {
                barFill.classList.add('pulse');
            }
        
    }
    });
}

/* ========== HUD Live Updater ========== */

export function startLiveHUDUpdate(discretionaryBreakdownData) {
    const growthRates = {};
    let isUserActive = true;
    let lastActivityTime = Date.now();
    let isRewinding = false;

    subCategories[categories.discretionary].forEach(subCat => {
        if (subCat.toLowerCase() !== 'unallocated') {
            const { available = 0, dailyCap = 1 } = discretionaryBreakdownData?.[subCat] || {};
            const ratePerSecond = dailyCap / 86400;

            growthRates[subCat] = {
                availableAmount: available,
                capAmount: dailyCap,
                ratePerSecond,
                savedAvailableAmount: available
            };

            growthRates["Power"] = {
                availableAmount: 0,
                capAmount: discretionaryBreakdownData.maxEmpower,
                ratePerSecond : discretionaryBreakdownData.maxEmpower / 86400 ,
                savedAvailableAmount: 0
            };

            
        }
    });

    function updateBars() {
        const bars = document.querySelectorAll('.bar-fill');
        const labels = document.querySelectorAll('.bar-label');
   
        subCategories[categories.discretionary].forEach((subCat, index) => {
            
            if (subCat.toLowerCase() !== 'unallocated') {
                const data = growthRates[subCat];
                const bar = bars[index + 1];
                const label = labels[index + 1];

                const speedMultiplier = isUserActive ? 1 : 100;
                data.availableAmount = Math.min(data.availableAmount + (data.ratePerSecond * speedMultiplier), data.capAmount);

                if (bar) {
                    bar.style.width = `${(data.availableAmount / data.capAmount) * 100}%`;
                    bar.classList.toggle('fast-forward', !isUserActive);
                }
                if (label) {
                    label.innerText = `£${data.availableAmount.toFixed(2)} / £${data.capAmount.toFixed(2)}`;
                }
            }
        });


    }

    function startRewind() {
        if (isRewinding) return;
        isRewinding = true;
        const rewindStart = Date.now();
        const rewindFrom = {};

        subCategories[categories.discretionary].forEach(subCat => {
            if (subCat.toLowerCase() !== 'unallocated') {
                rewindFrom[subCat] = growthRates[subCat].availableAmount;
            }
        });

        function animateRewind() {
            const elapsed = Date.now() - rewindStart;
            const progress = Math.min(elapsed / 100, 1);

            subCategories[categories.discretionary].forEach(subCat => {
                if (subCat.toLowerCase() !== 'unallocated') {
                    const start = rewindFrom[subCat];
                    const end = growthRates[subCat].savedAvailableAmount;
                    growthRates[subCat].availableAmount = start - (start - end) * progress;
                }
            });

            updateBars();

            if (progress < 1) {
                requestAnimationFrame(animateRewind);
            } else {
                triggerRipple();
                isRewinding = false;
            }
        }

        function triggerRipple() {
            document.querySelectorAll('.bar-fill').forEach(bar => {
                bar.classList.add('ripple');
                setTimeout(() => bar.classList.remove('ripple'), 500);
            });
        }

        requestAnimationFrame(animateRewind);
    }

    function resetActivityTimer() {
        if (!isUserActive) startRewind();
        isUserActive = true;
        lastActivityTime = Date.now();
    }

    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(event =>
        document.addEventListener(event, resetActivityTimer)
    );

    setInterval(() => {
        if (Date.now() - lastActivityTime > 12000) {
            if (isUserActive) {
                subCategories[categories.discretionary].forEach(subCat => {
                    if (subCat.toLowerCase() !== 'unallocated') {
                        growthRates[subCat].savedAvailableAmount = growthRates[subCat].availableAmount;
                    }
                });
            }
            isUserActive = false;
        }
    }, 1000);

    setInterval(updateBars, 100);
}

/* ========== Contribution Bar Drainer (for Avatar) ========== */

function createDrainBar(resource, barElement, buttonElement, labelElement, soundEffectPath) {
    let drainInterval;
    let accumulatedAmount = 0;
    let empowerLevel
    let addToEmpowerLevel = 0;
    let isDraining = false;
    const audio = soundEffectPath ? new Audio(soundEffectPath) : null;

    window.localStorage.setItem('empowerLevel', JSON.stringify(0));

    buttonElement.addEventListener('pointerdown', (e) => {
        const queuedEmpowerLevel = JSON.parse(localStorage.getItem('empowerLevel'))
        if(queuedEmpowerLevel < 5){
        e.preventDefault(); // Prevents mobile from interpreting touch as a gesture
        if (!resource || resource.availableAmount <= 0 || isDraining) return;
        isDraining = true;
        accumulatedAmount = 0;
        

        
        

       // if (audio) audio.play();

        drainInterval = setInterval(() => {
            const drainPerTick = resource.ratePerSecond * 0.1;
            resource.availableAmount = Math.max(0, resource.availableAmount - drainPerTick);
            accumulatedAmount += drainPerTick;

            // const unitsEarned = Math.floor((resource.capAmount - resource.availableAmount) / (resource.capAmount * 0.195) );
            const unitsEarned = Math.floor( accumulatedAmount/ (resource.capAmount * 0.195) );
            console.log(unitsEarned, queuedEmpowerLevel)

            
            
            //if (unitsEarned > empowerLevel) {
                 addToEmpowerLevel = Math.min(unitsEarned,5 - queuedEmpowerLevel);
                empowerLevel = addToEmpowerLevel + queuedEmpowerLevel


            // Loop through all levels up to the new empower level
            for (let i = 1; i <= queuedEmpowerLevel + addToEmpowerLevel; i++) {
                const el = document.getElementById(`empower-level-${i}`);
                if (el) {
                    el.classList.add('empower-active');
                    el.classList.remove('empower-inactive');
                }
            }
            //}
            

            const percentage = (resource.availableAmount / resource.capAmount) * 100;
            barElement.style.width = `${percentage}%`;
            barElement.classList.toggle('glow-effect', percentage > 0);

            labelElement.innerText = `£${resource.availableAmount.toFixed(2)} / £${resource.capAmount.toFixed(2)}`;
        }, 100);
        } 
    });

    const stopDrain = () => {
        if (!isDraining) return;
        clearInterval(drainInterval);
        isDraining = false;
        
        window.localStorage.setItem('empowerLevel', JSON.stringify(empowerLevel));
        openPaymentModal(accumulatedAmount.toFixed(2), empowerLevel);
        barElement.classList.remove('glow-effect');

        barElement.style.width = `${100}%`;
        resource.availableAmount = resource.capAmount
            labelElement.innerText = `£${resource.capAmount.toFixed(2)} / £${resource.capAmount.toFixed(2)}`;
    };

    buttonElement.addEventListener('pointerup', stopDrain);
    buttonElement.addEventListener('pointerleave', stopDrain);
}

document.addEventListener('DOMContentLoaded', () => {
    const discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'));
    const baseCapAmount = discretionaryData.dContributionsTarget_Avatar
   
    const contributionsResource = {
        availableAmount: baseCapAmount * 60,
        capAmount: baseCapAmount * 60,
        ratePerSecond: baseCapAmount * 0.25 * 60
    };

    createDrainBar(
        contributionsResource,
        document.getElementById('contributions-bar'),
        document.getElementById('contributions-drain-btn'),
        document.getElementById('contributions-bar-label'),
        '/assets/sounds/drain-sound.mp3'
    );
});

// Attribute Panel
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const playerRef = doc(db, 'players', user.uid)

  let remainingPoints = 0;
  const pointsDisplay = document.getElementById("points-remaining");
  const attributes = {
    resilience: 0,
    focus: 0,
    adaptability: 0
  };

  loadAttributesFromPlayerData();

  // Populate from Firestore
    async function loadAttributesFromPlayerData() {
    const snapshot = await getDoc(playerRef);
    if (snapshot.exists()) {
        const playerData = snapshot.data();
        const attributeData = playerData.attributePoints || {};

        const avatarData = JSON.parse(localStorage.getItem('avatarData'))
        
        
        attributes.resilience = attributeData.resilience ?? 0;
        attributes.focus = attributeData.focus ?? 0;
        attributes.adaptability = attributeData.adaptability ?? 0;
        const spentPoints = attributes.resilience + attributes.focus + attributes.adaptability
        remainingPoints = (avatarData.contributionLevel * 10) - spentPoints ?? 0;//attributeData.unspent ?? 0;

        updateUI();
    } else {
        console.warn("No player data found.");
    }
    }


    async function saveAttributesToFirestore(playerRef) {
  const confirmed = confirm("Are you sure you want to lock in your choices? This cannot be undone.");
  if (!confirmed) return;

  try {
    await setDoc(playerRef, {
    attributePoints: {
      unspent: remainingPoints,
      resilience: attributes.resilience,
      focus: attributes.focus,
      adaptability: attributes.adaptability
    }
    }, { merge: true });

    alert("Your attributes have been saved!");
  } catch (err) {
    console.error("Error saving to Firestore:", err);
    alert("There was an error saving your choices.");
  }
    }


document.getElementById("save-attributes").addEventListener("click", () => {
  saveAttributesToFirestore(playerRef);
});


  function updateUI() {
    pointsDisplay.textContent = remainingPoints;
    for (let key in attributes) {
      document.getElementById(`${key}-value`).textContent = attributes[key];
    }
  }

  document.querySelectorAll(".increment").forEach(button => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest(".attribute-row");
      const attr = row.dataset.attribute;
      if (remainingPoints > 0) {
        attributes[attr]++;
        remainingPoints--;
        updateUI();
      }
    });
  });

  document.querySelectorAll(".decrement").forEach(button => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest(".attribute-row");
      const attr = row.dataset.attribute;
      if (attributes[attr] > 0) {
        attributes[attr]--;
        remainingPoints++;
        updateUI();
      }
    });
  });

  updateUI();
});




/* ========== Modal Helpers ========== */

export function openPaymentModal(amountSpent) {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('hidden');
    modal.style.opacity = 1;
    modal.style.visibility = 'visible';
    document.getElementById('amount').value = amountSpent;
    modal.style.display = 'block';

    const empowerBtn = document.getElementById('submit-payment');
    // or pass a specific amount if you like
    if (empowerBtn) empowerBtn.addEventListener('click', () => { submitPayment(amountSpent
    )});

}

 export async function submitPayment(amountSpent){



    const modal = document.getElementById('payment-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';

    for (let i = 1; i <= 5; i++) {
                const el = document.getElementById(`empower-level-${i}`);
                if (el) {
                    el.classList.add('empower-inactive');
                    el.classList.remove('empower-active');
                }
    }


    window.localStorage.setItem('empowerLevel', JSON.stringify(0));

    

    const user = JSON.parse(localStorage.getItem('user'));
    const playerRef = doc(db, 'players', user.uid)
    const userDoc = await getDoc(playerRef);
    const playerData = userDoc.data();
    const newAmount = playerData.avatarData.avatarContribution + parseFloat(amountSpent)
    try {
    await setDoc(playerRef, {
    avatarData: {
      avatarContribution: parseFloat(newAmount),
    }
    }, { merge: true });

    //alert("Your energy has been added to your avatar!");
    fetchDataAndRenderMyFiDashboard(user.uid)
  } catch (err) {
    console.error("Error saving to Firestore:", err);
    alert("There was an error saving your choices.");
  }
}

export function openLinkSheetModal(amountSpent) {
    const modal = document.getElementById('google-sheet-modal');
    modal.classList.remove('hidden');
    modal.style.opacity = 1;
    modal.style.visibility = 'visible';
    document.getElementById('amount').value = amountSpent;
    modal.style.display = 'block';

}

export function closeSheetModal() {
    const modal = document.getElementById('google-sheet-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}


/* ========== Manual Entry Button Controls ========== */

export function showManualEntryButton() {
    const manualBtn = document.getElementById('manual-entry-btn');
    if (manualBtn) manualBtn.style.display = 'inline-block';
}

export function showLinkAccountButton() {
    const Btn = document.getElementById('link-sheet-btn');
    if (Btn) Btn.style.display = 'inline-block';
}

export function showUnlinkAccountButton() {
    const Btn = document.getElementById('unlink-sheet-btn');
    if (Btn) Btn.style.display = 'inline-block';
}

export function hideManualEntryButton() {
    const Btn = document.getElementById('manual-entry-btn');
    if (Btn) Btn.style.display = 'none';
}

export function hideLinkAccountButton() {
    const Btn = document.getElementById('link-sheet-btn');
    if (Btn) Btn.style.display = 'none';
}


export function hideUnlinkAccountButton() {
    const Btn = document.getElementById('unlink-sheet-btn');
    if (Btn) Btn.style.display = 'none';
}
