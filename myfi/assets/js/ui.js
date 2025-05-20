// ui.js
import { auth, db } from './auth.js';
import { getDoc, doc, setDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { categories, subCategories, incomeCategory } from './config.js';
import { loadDashboard, getPlayerData, loadFromLocalStorage, saveAttributesToFirestore, saveToLocalStorage } from './dashboard.js';
import { getAvatarStatData } from './calculations.js'; 
import playerDataManager from './playerDataManager.js';


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
  

/* ============ Profile Rendering =========== */

export function renderProfile() {
    console.log('Rendering Profile...' )
    const playerData = playerDataManager.get()
    renderAvatarDetails(playerData)
    renderAvatarStats(playerData)
    renderChampionStats()
    
}

    function renderAvatarDetails(playerData){
        document.getElementById('alias-banner').innerText = playerData.alias || 'No Alias';

    const avatarData = playerData.avatarData

    // Spending Persona

    // Avatar Level
    const avatarLevelElement = document.getElementById('profile-level');
    avatarLevelElement.innerText = avatarData.contributionLevel !== undefined
        ? `Lvl ${avatarData.contributionLevel.toFixed(0)}`
        : 'Lvl 1';

    // Avatar Pic
    const avatarPic = document.getElementById('profile-picture');
    avatarPic.style.backgroundImage = "url('./assets/img/default-profile.png')";

    if (avatarData.avatarPictureUrl) {
        avatarPic.style.backgroundImage = `url('${avatarData.avatarPictureUrl}')`;
    }

    // Charge
    const powerLevelElement = document.getElementById('power-level');
    powerLevelElement.innerText = avatarData.contributionPercent_Avatar !== undefined
    ? `${avatarData.contributionPercent_Avatar.toFixed(2) * 100}%`
    : '0';

    // Power
    const powerTotalElement = document.getElementById('power-total');
    powerTotalElement.innerText = playerData.avatarData.avatarContribution !== undefined
    ? `${avatarData.avatarContribution.toFixed(0)}`
    : '0';

    
    }

    async function renderAvatarStats(playerData) {

        const attributePoints = playerData.attributePoints
        const avatarData = playerData.avatarData
        
        const spentPoints = attributePoints.resilience + attributePoints.focus + attributePoints.adaptability
        const unspentPoints = (avatarData.contributionLevel * 10) - spentPoints ?? 0;//attributeData.unspent ?? 0;
        attributePoints.unspent = unspentPoints

        updateUI(attributePoints)

        document.querySelectorAll(".increment").forEach(button => {
            button.addEventListener("click", (e) => {
                
                const row = e.target.closest(".attribute-row");
                const attr = row.dataset.attribute;
                if (attributePoints.unspent > 0) {
                
                    attributePoints[attr]++;
                    attributePoints.unspent--;
                    updateUI(attributePoints)

                }
            });
        });

        document.querySelectorAll(".decrement").forEach(button => {
            button.addEventListener("click", (e) => {
            const row = e.target.closest(".attribute-row");
            const attr = row.dataset.attribute;
            if (attributePoints[attr] > 0) {
                attributePoints[attr]--;
                attributePoints.unspent++;
                updateUI(attributePoints);
            }
            });
        });

        document.querySelector("#reset-attributes").addEventListener("click", () => {
            let totalSpent = 0;

            for (const key in attributePoints) {
                if (key !== "unspent") {
                    totalSpent += attributePoints[key];
                    attributePoints[key] = 0;
                }
            }

            attributePoints.unspent += totalSpent;
            updateUI(attributePoints);
        });
    }

        function updateUI(attributePoints){
            for (let key in attributePoints) {
                document.getElementById(`${key}-value`).textContent = attributePoints[key];
            }

            playerDataManager.update({
                attributePoints: attributePoints,
            });
            saveToLocalStorage('attributeData', attributePoints)
        }

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById("save-attributes").addEventListener("click", () => {
                    //const attributeData = loadFromLocalStorage('attributeData')
                    //saveAttributesToFirestore(attributeData);
                    playerDataManager.save()

                   
                });
        });

    const avatarStatConfig = {
    health: { color: '#e53935', glow: '#ff8a80' },
    mana: { color: '#1e88e5', glow: '#82b1ff' },
    stamina: { color: '#43a047', glow: '#b9f6ca' },
    };

    async function renderChampionStats(statData = null) {
        if(!statData){
            
            const selectedavatarStub = {
                            health: {
                                base:1,
                                empower: 0,
                                hud:0,
                            },
                            mana: {
                                base:1.5,
                                empower:0,
                                hud:0,
                            },
                            stamina: {
                                base:3,
                                empower:0,
                                hud:0,
                            }, 
                            lowestStat: "Health"
                        }

            statData = await getAvatarStatData(selectedavatarStub)

        }

        

    const container = document.getElementById('avatar-stats');

    const rows = container.querySelectorAll('.avatar-stat');

    rows.forEach(row => {
        
        
        const stat = row.dataset.stat;
        const value_Base = statData[stat].base || 0;
        const value_Empower = statData[stat].empower || 0;
        const value_Charge = statData[stat].charge || 0;
        const value_Hud = statData[stat].hud || 0;
        
        const blocksWrapper = row.querySelector('.stat-blocks');
        blocksWrapper.innerHTML = ''; // Clear old blocks


        // Base
        for (let i = 0; i < value_Base; i++) {
        const block = document.createElement('div');
        block.classList.add('block');
        
            block.classList.add('filled');
            block.style.backgroundColor = avatarStatConfig[stat].color;
            block.style.boxShadow = `0 0 5px ${avatarStatConfig[stat].glow}`;
            block.style.animationDelay = `${i * 50}ms`;
        
        blocksWrapper.appendChild(block);
        }
        // Empower 
        for (let i = 0; i < value_Empower; i++) {
        const bonusBlock = document.createElement('div');
        bonusBlock.classList.add('block', 'bonus');
        bonusBlock.style.backgroundColor = '#6435e5' //'purple';
        bonusBlock.style.boxShadow = `0 0 5px ${avatarStatConfig[stat].color}`; //purple';
        bonusBlock.style.animationDelay = `${(i + 10) * 50}ms`;
        blocksWrapper.appendChild(bonusBlock);
        }

        // Charge 
        for (let i = 0; i < value_Charge; i++) {
        const bonusBlock = document.createElement('div');
        bonusBlock.classList.add('block', 'bonus');
        bonusBlock.style.backgroundColor = '#4a25af' //'purple';'
        bonusBlock.style.boxShadow = '0 0 5px purple';
        bonusBlock.style.animationDelay = `${(i + 10) * 50}ms`;
        blocksWrapper.appendChild(bonusBlock);
        }


        // Hud
        for (let i = 0; i < value_Hud; i++) {
        const bonusBlock = document.createElement('div');
        bonusBlock.classList.add('block', 'bonus');
        bonusBlock.style.backgroundColor = 'orange';
        bonusBlock.style.boxShadow = `0 0 5px ${avatarStatConfig[stat].glow}`;
        bonusBlock.style.animationDelay = `${(i + 10) * 50}ms`;
        blocksWrapper.appendChild(bonusBlock);
        }

        

        

        
    });
    }




/* ========== HUD Renderer ========== */


// export async function renderHUD(discretionaryData) {
//     const upperHudContainer_Vitals = document.getElementById('upper-hud-vitals');
//     upperHudContainer_Vitals.innerHTML = "";

//     subCategories[categories.discretionary].forEach(subCat => {
//         if (subCat.toLowerCase() !== 'unallocated')  {
            
//             const availableResource = discretionaryData[`availableResource_${subCat}`] ?? 0;
//             const dSpendingCap = discretionaryData[`dSpendingCap_${subCat}`] ?? 1;
//             const storedDays = discretionaryData[`storedDays_${subCat}`] ?? 0;

//             // Use the variables as needed
           

//             const percentage = Math.min((availableResource / dSpendingCap) * 100, 100);

            

//             const barWrapper = document.createElement('div');
//             barWrapper.className = 'bar-wrapper';

//             const label = document.createElement('div');
//             label.className = 'bar-label';
//             label.innerText = `£0.00 / £${dSpendingCap.toFixed(2)}`;

//             const barBackground = document.createElement('div');
//             barBackground.className = 'bar-background';

//             const barFill = document.createElement('div');
//             barFill.className = `bar-fill ${subCat.toLowerCase()}`;
//             barFill.style.width = `0%`;

//             // Circle badge for stored days
//             const circleBadge = document.createElement('div');
//             circleBadge.className = 'circle-badge';
//             circleBadge.innerText = `${Math.round(storedDays)}`;

//             barBackground.append(barFill, circleBadge);
//             barWrapper.append(label, barBackground);
//             upperHudContainer_Vitals.append(subCat, barWrapper);

//             // Animate
//             animateProgressBar(barFill, percentage);
//             animateAmount(label, 0, availableResource, dSpendingCap);

//             if (percentage >= 90) {
//                 barFill.classList.add('pulse');
//             }
        
//     }
//     });
// }

export async function renderHUD() {
    console.log('Rendering HUD...' )
    const playerData = playerDataManager.get()

    const hudData = playerData.hudData

    const upperHudContainer_Vitals = document.getElementById('upper-hud-vitals');
    upperHudContainer_Vitals.innerHTML = "";

    const segmentsPerSubCat = {
        needs: 7,
        wants: 7,
        growth: 7
    };

    subCategories[categories.discretionary].forEach(subCat => {

        if (subCat.toLowerCase() !== 'unallocated') {

            const availableResource = hudData[`availableResource_${subCat}`] ?? 0;
            const dSpendingCap = hudData[`dSpendingCap_${subCat}`] ?? 1;
            const storedDays = hudData[`storedDays_${subCat}`] ?? 0;

            const percentage = Math.min((availableResource / dSpendingCap) * 100, 100);

            const barWrapper = document.createElement('div');
            barWrapper.className = 'bar-wrapper';

            // Bar background
            const barBackground = document.createElement('div');
            barBackground.className = 'bar-background';

            // Bar fill
            const barFill = document.createElement('div');
            barFill.className = `bar-fill ${subCat.toLowerCase()}`;
            barFill.style.width = `0%`;

            // Bar segment overlay
            const stripeOverlay = document.createElement('div');
            stripeOverlay.className = 'bar-stripes';
            
            // Bar content overlay
            const barContent = document.createElement('div');
            barContent.className = 'bar-inner-content';

            const leftText = document.createElement('div');
            leftText.className = 'bar-left-text';
            leftText.innerText = subCat // `£${availableResource.toFixed(2)} / £${dSpendingCap.toFixed(2)}`;

            const rightText = document.createElement('div');
            rightText.className = 'bar-right-text';
            rightText.innerText = `£${availableResource.toFixed(2)} / £${dSpendingCap.toFixed(2)}`;

            barContent.append(leftText, rightText);

            // Icon inside bar (replace storedDays badge)
            const icon = document.createElement('img');
            icon.className = 'vital-icon';
            icon.src = `/assets/img/${subCat.toLowerCase()}.png`; // Ensure you have matching icons

            // New storedDays circle badge (outside right)
            const storedDaysBadge = document.createElement('div');
            storedDaysBadge.className = 'circle-badge outside-right';
            storedDaysBadge.innerText = `${Math.round(storedDays)}`;
            storedDaysBadge.classList.add(subCat.toLowerCase()); // E.g., 'needs', 'wants'

            applyPulseSettings(storedDaysBadge, storedDays, {
                minDays: 1,
                maxDays: 31,
                minDuration: 0.6,
                maxDuration: 3.0
            });
                        

            const badgeWrapper = document.createElement('div');
            badgeWrapper.className = 'badge-wrapper';
            badgeWrapper.appendChild(storedDaysBadge);  
            barBackground.appendChild(stripeOverlay);
            barBackground.append(barFill, barContent,icon);
            barWrapper.append(barBackground, badgeWrapper);
            upperHudContainer_Vitals.append(barWrapper);

            // Animate
             animateProgressBar(barFill, percentage);
            animateAmount(rightText, 0, availableResource, dSpendingCap);

            if (percentage >= 90) {
                barFill.classList.add('pulse');


            }
        }
    });

   
    const hudBalanceElement = document.getElementById('discretionary-current-balance');
    hudBalanceElement.innerText = hudData.availableResource_Total !== undefined
        ? `£${hudData.availableResource_Total.toFixed(2)}`
        : '£0.00';
    // const balanceElement = document.getElementById('current-balance');
    // balanceElement.innerText = playerData.financeSummary.currentBalance !== undefined
    //     ? `£${playerData.financeSummary.currentBalance.toFixed(2)}`
    //     : '£0.00';
}

    function applyPulseSettings(badgeEl, storedDays, {
    minDays = 1,
    maxDays = 31,
    minDuration = 0.6,
    maxDuration = 3.0,
    crackMin = -1,
    crackMax = -31,
    } = {}) {
    const category = badgeEl.classList.contains('growth') ? 'growth'
                    : badgeEl.classList.contains('wants') ? 'wants'
                    : badgeEl.classList.contains('needs') ? 'needs'
                    : null;

    badgeEl.classList.remove('growth-pulse', 'wants-pulse', 'needs-pulse', 'crack-effect');
    badgeEl.style.removeProperty('--pulse-duration');
    badgeEl.style.removeProperty('--crack-magnitude');
    badgeEl.style.removeProperty('--crack-duration');

    if (!category) return;

    if (storedDays < minDays) {
        const clampedNeg = Math.max(crackMin, Math.min(crackMax, storedDays));
        const normalized = (clampedNeg - crackMin) / (crackMax - crackMin); // [0, 1]
        const magnitude = 1 + normalized * 4; // Range [1, 5]
        const duration = 1.8 - normalized * 0.8; // Faster if more negative, e.g. 1s to 1.8s

        badgeEl.style.setProperty('--crack-magnitude', magnitude.toFixed(2));
        badgeEl.style.setProperty('--crack-duration', `${duration.toFixed(2)}s`);
        badgeEl.classList.add('crack-effect');
        return;
    }

    // Otherwise, apply normal pulsing
    const clamped = Math.min(maxDays, Math.max(minDays, storedDays));
    const normalized = (clamped - minDays) / (maxDays - minDays);
    const duration = maxDuration - normalized * (maxDuration - minDuration);

    badgeEl.style.setProperty('--pulse-duration', `${duration.toFixed(2)}s`);
    badgeEl.classList.add(`${category}-pulse`);
    }




/* ========== Animation Engine ========== */

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
        availableAmount: baseCapAmount * 30,
        capAmount: baseCapAmount * 30,
        ratePerSecond: baseCapAmount * 0.25 * 30
    };

    createDrainBar(
        contributionsResource,
        document.getElementById('contributions-bar'),
        document.getElementById('contributions-drain-btn'),
        document.getElementById('contributions-bar-label'),
        '/assets/sounds/drain-sound.mp3'
    );
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

    const alias = loadFromLocalStorage('alias')
    console.log(alias)

    const submitURL = "https://monzo.me/emkaybarrie?amount=10.00&d=MyFi_" + alias

    window.open(submitURL, '_blank');

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


    

    

    const user = JSON.parse(localStorage.getItem('user'));
    const playerRef = doc(db, 'players', user.uid)
    const userDoc = await getDoc(playerRef);
    const playerData = userDoc.data();
    const newAmount = playerData.avatarData.avatarContribution + parseFloat(amountSpent)
    try {
    await setDoc(playerRef, {
    avatarData: {
      avatarContribution: parseFloat(newAmount),
      avatarEmpowerLevel: JSON.parse(localStorage.getItem('empowerLevel'))
    }
    }, { merge: true });

    //alert("Your energy has been added to your avatar!");
    window.localStorage.setItem('empowerLevel', JSON.stringify(0));
    fetchDataAndRenderMyFiDashboard(user.uid)
    document.addEventListener('DOMContentLoaded', () => {
    loadAttributesFromPlayerData();
    })
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
