// ui.js

import { categories, subCategories, incomeCategory } from './config.js';
import { getDiscretionaryData, getContributionData } from './calculations.js';

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
        ? `Available Energy: £${discretionaryData.availableResource_Total.toFixed(2)}`
        : 'Available Energy: £0.00';
    const balanceElement = document.getElementById('current-balance');
    balanceElement.innerText = playerData.financeSummary.currentBalance !== undefined
        ? `Balance: £${playerData.financeSummary.currentBalance.toFixed(2)}`
        : 'Balance: £0.00';

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
    let empowerLevel = 0;
    let isDraining = false;
    const audio = soundEffectPath ? new Audio(soundEffectPath) : null;

    buttonElement.addEventListener('mousedown', () => {
        if (!resource || resource.availableAmount <= 0 || isDraining) return;
        isDraining = true;
        accumulatedAmount = 0;

        
        

       // if (audio) audio.play();

        drainInterval = setInterval(() => {
            const drainPerTick = resource.ratePerSecond * 0.1;
            resource.availableAmount = Math.max(0, resource.availableAmount - drainPerTick);
            accumulatedAmount += drainPerTick;

            const unitsEarned = Math.floor((resource.capAmount - resource.availableAmount) / (resource.capAmount * 0.195) );

            if (unitsEarned > empowerLevel) {
                empowerLevel = unitsEarned;
                const el = document.getElementById('empower-level');
                el.textContent = empowerLevel;
            }

            const percentage = (resource.availableAmount / resource.capAmount) * 100;
            barElement.style.width = `${percentage}%`;
            barElement.classList.toggle('glow-effect', percentage > 0);

            labelElement.innerText = `£${resource.availableAmount.toFixed(2)} / £${resource.capAmount.toFixed(2)}`;
        }, 100);
    });

    const stopDrain = () => {
        if (!isDraining) return;
        clearInterval(drainInterval);
        isDraining = false;
        openPaymentModal(accumulatedAmount.toFixed(2));
        barElement.classList.remove('glow-effect');
    };

    buttonElement.addEventListener('mouseup', stopDrain);
    buttonElement.addEventListener('mouseleave', stopDrain);
}

document.addEventListener('DOMContentLoaded', () => {
    const discretionaryData = JSON.parse(localStorage.getItem('discretionaryData'));
    const baseCapAmount = discretionaryData.dContributionsTarget_Avatar
   
    const contributionsResource = {
        availableAmount: baseCapAmount,
        capAmount: baseCapAmount,
        ratePerSecond: baseCapAmount * 0.25
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
