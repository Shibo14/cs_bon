// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your deployed backend URL

// State
let currentUser = null;
let currentScreen = 'home';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Set theme
        document.body.style.backgroundColor = tg.themeParams.bg_color || '#1a1a2e';

        // Load user data
        await loadUserData();

        // Load initial screen
        showScreen('home');
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize app');
    }
}

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': tg.initData
        };

        const options = {
            method,
            headers
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }

        return data.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load user data
async function loadUserData() {
    try {
        const userData = await apiCall('/users/me');
        currentUser = userData;
        updateBalance(userData.crystals);

        // Check if Steam trade URL is set
        if (!userData.steamTradeUrl) {
            document.getElementById('tradeUrlSetup').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // For demo, set default balance
        updateBalance(100);
    }
}

// Update balance display
function updateBalance(amount) {
    document.getElementById('crystalBalance').textContent = amount;
    document.getElementById('homeBalance').textContent = amount;
}

// Screen navigation
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    // Remove active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('tab-active');
    });

    // Show selected screen
    document.getElementById(`screen-${screenName}`).classList.remove('hidden');

    // Set active tab
    event?.target?.classList.add('tab-active');

    currentScreen = screenName;

    // Load screen data
    loadScreenData(screenName);
}

// Load screen data
async function loadScreenData(screenName) {
    try {
        switch (screenName) {
            case 'home':
                await loadHomeData();
                break;
            case 'cases':
                await loadCases();
                break;
            case 'inventory':
                await loadInventory();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${screenName} data:`, error);
    }
}

// Load home screen data
async function loadHomeData() {
    try {
        const stats = await apiCall('/users/stats');
        document.getElementById('homeItemsCount').textContent = stats.stats.availableItems;
    } catch (error) {
        console.error('Error loading home data:', error);
    }
}

// Load cases
async function loadCases() {
    try {
        const cases = await apiCall('/cases');
        const casesList = document.getElementById('casesList');
        casesList.innerHTML = '';

        if (cases.length === 0) {
            casesList.innerHTML = '<p class="text-gray-300 col-span-full text-center">No cases available</p>';
            return;
        }

        cases.forEach(caseItem => {
            const caseCard = createCaseCard(caseItem);
            casesList.appendChild(caseCard);
        });
    } catch (error) {
        console.error('Error loading cases:', error);
        document.getElementById('casesList').innerHTML = '<p class="text-red-400 col-span-full text-center">Failed to load cases</p>';
    }
}

// Create case card element
function createCaseCard(caseItem) {
    const div = document.createElement('div');
    div.className = 'case-card rounded-lg p-6 cursor-pointer';
    div.onclick = () => openCase(caseItem._id, caseItem.price);

    div.innerHTML = `
        <img src="${caseItem.imageUrl}" alt="${caseItem.name}" class="w-full h-48 object-contain mb-4 rounded-lg">
        <h3 class="text-xl font-bold mb-2">${caseItem.name}</h3>
        <p class="text-gray-300 mb-4">${caseItem.description || ''}</p>
        <div class="flex justify-between items-center">
            <span class="text-2xl font-bold text-yellow-400">💎 ${caseItem.price}</span>
            <button class="btn-primary px-6 py-2 rounded-lg font-bold">Open</button>
        </div>
    `;

    return div;
}

// Open case
async function openCase(caseId, price) {
    try {
        // Check if user has enough crystals
        if (currentUser && currentUser.crystals < price) {
            showError('Not enough crystals!');
            return;
        }

        // Show opening modal
        document.getElementById('openingModal').classList.remove('hidden');

        // Call API to open case
        const result = await apiCall('/cases/open', 'POST', { caseId });

        // Update balance
        updateBalance(result.remainingCrystals);
        if (currentUser) {
            currentUser.crystals = result.remainingCrystals;
        }

        // Wait a bit for animation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Hide opening modal
        document.getElementById('openingModal').classList.add('hidden');

        // Show result
        showWonSkin(result.wonSkin);
    } catch (error) {
        document.getElementById('openingModal').classList.add('hidden');
        showError(error.message || 'Failed to open case');
    }
}

// Show won skin
function showWonSkin(skin) {
    document.getElementById('wonSkinImage').src = skin.imageUrl;
    document.getElementById('wonSkinName').textContent = skin.name;
    document.getElementById('wonSkinPrice').textContent = `$${skin.price.toFixed(2)}`;
    document.getElementById('resultModal').classList.remove('hidden');
}

// Close result modal
function closeResultModal() {
    document.getElementById('resultModal').classList.add('hidden');
    // Reload inventory
    if (currentScreen === 'inventory') {
        loadInventory();
    }
}

// Load inventory
async function loadInventory() {
    try {
        const inventory = await apiCall('/inventory/available');
        const inventoryList = document.getElementById('inventoryList');
        inventoryList.innerHTML = '';

        if (inventory.length === 0) {
            inventoryList.innerHTML = '<p class="text-gray-300 col-span-full text-center">No items in inventory</p>';
            return;
        }

        inventory.forEach(item => {
            const itemCard = createInventoryItemCard(item);
            inventoryList.appendChild(itemCard);
        });
    } catch (error) {
        console.error('Error loading inventory:', error);
        document.getElementById('inventoryList').innerHTML = '<p class="text-red-400 col-span-full text-center">Failed to load inventory</p>';
    }
}

// Create inventory item card
function createInventoryItemCard(item) {
    const div = document.createElement('div');
    const rarityClass = getRarityClass(item.skinId.rarity);
    div.className = `skin-card rounded-lg p-4 border-2 ${rarityClass}`;

    div.innerHTML = `
        <img src="${item.skinId.imageUrl}" alt="${item.skinId.name}" class="w-full h-32 object-contain mb-3 rounded-lg">
        <h3 class="font-bold mb-2 text-sm">${item.skinId.name}</h3>
        <p class="text-yellow-400 font-bold mb-3">$${item.skinId.price.toFixed(2)}</p>
        <button onclick="withdrawItem('${item._id}')" class="btn-primary px-4 py-2 rounded-lg font-bold w-full text-sm">
            Withdraw Skin
        </button>
    `;

    return div;
}

// Get rarity CSS class
function getRarityClass(rarity) {
    const rarityMap = {
        'Covert': 'rarity-covert',
        'Classified': 'rarity-classified',
        'Restricted': 'rarity-restricted',
        'Mil-Spec': 'rarity-mil-spec'
    };
    return rarityMap[rarity] || '';
}

// Withdraw item
async function withdrawItem(itemId) {
    try {
        // Check if Steam trade URL is set
        if (!currentUser?.steamTradeUrl) {
            showError('Please set your Steam trade URL first!');
            document.getElementById('tradeUrlSetup').classList.remove('hidden');
            return;
        }

        if (!confirm('Are you sure you want to withdraw this item?')) {
            return;
        }

        await apiCall('/withdraw', 'POST', { inventoryItemId: itemId });

        showSuccess('Withdraw request created! You will receive a trade offer soon.');
        loadInventory();
    } catch (error) {
        showError(error.message || 'Failed to create withdraw request');
    }
}

// Save Steam trade URL
async function saveSteamTradeUrl() {
    try {
        const tradeUrl = document.getElementById('tradeUrlInput').value.trim();

        if (!tradeUrl) {
            showError('Please enter a valid trade URL');
            return;
        }

        if (!tradeUrl.includes('steamcommunity.com/tradeoffer/new/')) {
            showError('Invalid Steam trade URL format');
            return;
        }

        await apiCall('/users/steam-trade-url', 'POST', { steamTradeUrl: tradeUrl });

        currentUser.steamTradeUrl = tradeUrl;
        document.getElementById('tradeUrlSetup').classList.add('hidden');
        showSuccess('Steam trade URL saved successfully!');
    } catch (error) {
        showError(error.message || 'Failed to save trade URL');
    }
}

// Buy crystals
async function buyCrystals(amount, method) {
    try {
        let endpoint = '';
        switch (method) {
            case 'uzcard':
                endpoint = '/payment/uzcard';
                break;
            case 'click':
                endpoint = '/payment/click';
                break;
            case 'stars':
                endpoint = '/payment/stars';
                break;
            default:
                throw new Error('Invalid payment method');
        }

        const result = await apiCall(endpoint, 'POST', { amount });

        // For demo, show success message
        showSuccess(`Payment initiated! Payment ID: ${result.paymentId}`);

        // In production, redirect to payment page or open invoice
        if (result.redirectUrl) {
            window.open(result.redirectUrl, '_blank');
        } else if (result.invoiceUrl) {
            tg.openInvoice(result.invoiceUrl);
        }
    } catch (error) {
        showError(error.message || 'Failed to initiate payment');
    }
}

// Show error message
function showError(message) {
    tg.showAlert(message);
}

// Show success message
function showSuccess(message) {
    tg.showAlert(message);
}

// Haptic feedback
function haptic() {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}
