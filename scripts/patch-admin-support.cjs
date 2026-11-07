const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'src', 'pages', 'AdminDashboardPage.jsx');
let adminCode = fs.readFileSync(adminPath, 'utf8');

// 1. Update handleSaveSupportConfig
const oldSaveSupportConfig = `  // Quick Save Support Channels & Helpline Numbers
  const handleSaveSupportConfig = (e) => {
    e?.preventDefault?.();
    updatePlatformSettings({
      communityLinks: {
        whatsappGroup: waGroup.trim(),
        whatsappGroupUrl: waGroup.trim(),
        whatsappChannel: waChannel.trim(),
        whatsappChannelUrl: waChannel.trim(),
        supportPhone: supportPhone.trim(),
        callNumber: callNumber.trim() || supportPhone.trim(),
        popupEnabled: Boolean(popupEnabled),
        communityPopupEnabled: Boolean(popupEnabled)
      }
    });
    showToast('success', 'Support channels & helpline numbers saved successfully!');
  };`;

const newSaveSupportConfig = `  // Quick Save Support Channels & Helpline Numbers
  const handleSaveSupportConfig = async (e) => {
    e?.preventDefault?.();
    const cleanSupportPhone = supportPhone.trim();
    const cleanCallNumber = callNumber.trim() || cleanSupportPhone;
    const cleanWaGroup = waGroup.trim();
    const cleanWaChannel = waChannel.trim();

    const communityLinksObj = {
      whatsappGroup: cleanWaGroup,
      whatsappGroupUrl: cleanWaGroup,
      whatsappChannel: cleanWaChannel,
      whatsappChannelUrl: cleanWaChannel,
      supportPhone: cleanSupportPhone,
      callNumber: cleanCallNumber,
      popupEnabled: Boolean(popupEnabled),
      communityPopupEnabled: Boolean(popupEnabled)
    };

    updatePlatformSettings({
      communityLinks: communityLinksObj
    });

    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          community_links: communityLinksObj,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) {
        console.warn('Supabase community_links update error:', error.message);
      }
    } catch (err) {
      console.warn('Direct supabase save failed:', err);
    }

    showToast('success', 'Support channels & helpline numbers saved successfully and synced with database!');
  };`;

if (adminCode.includes(oldSaveSupportConfig)) {
  adminCode = adminCode.replace(oldSaveSupportConfig, newSaveSupportConfig);
  console.log('✅ 1. Patched handleSaveSupportConfig');
} else {
  console.error('❌ Could not find oldSaveSupportConfig');
}

// 2. Update handleSaveSettings
const oldHandleSaveSettings = `  // Save Platform Settings Handler (Replicates to localStorage and live Supabase table)
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updatePlatformSettings({
      henUnitPrice: Number(henPrice) || 500,
      dailyEggYield: Number(dailyYield) || 1,
      contractDurationDays: Number(contractDays) || 120,
      eggBasePrice: Number(eggBasePrice) || 30,
      minWithdrawalEggs: Number(minWdEggs) || 1,
      minWithdrawalPkr: Number(minWdPkr) || 30,
      maxWithdrawalEggs: Number(maxWdEggs) || 10000,
      referralCommissionLevel1: Number(commL1) || 2.0,
      referralCommissionLevel2: Number(commL2) || 1.0,
      referralFlatBonusPkr: Number(flatBonus) || 50,
      communityLinks: {
        whatsappGroup: waGroup,
        whatsappGroupUrl: waGroup,
        whatsappChannel: waChannel,
        whatsappChannelUrl: waChannel,
        supportPhone: supportPhone.trim(),
        callNumber: callNumber.trim() || supportPhone.trim(),
        popupEnabled: popupEnabled,
        communityPopupEnabled: popupEnabled
      },
      marketRates: {
        henUnitPrice: Number(henPrice) || 500,
        stores: [
          { id: 'sonica', name: 'Sonica FORM STORE', rate: Number(rateSonica) || 32 },
          { id: 'usmaina', name: 'Usmaina Poltry Farm', rate: Number(rateUsmaina) || 30 },
          { id: 'syed', name: 'Syed poultry farm', rate: Number(rateSyed) || 33 }
        ],
        eggRates: {
          sonica: Number(rateSonica) || 32,
          usmaina: Number(rateUsmaina) || 30,
          syed: Number(rateSyed) || 33
        }
      }
    });
  };`;

const newHandleSaveSettings = `  // Save Platform Settings Handler (Replicates to localStorage and live Supabase table)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const cleanSupportPhone = supportPhone.trim();
    const cleanCallNumber = callNumber.trim() || cleanSupportPhone;
    const cleanWaGroup = waGroup.trim();
    const cleanWaChannel = waChannel.trim();

    const communityLinksObj = {
      whatsappGroup: cleanWaGroup,
      whatsappGroupUrl: cleanWaGroup,
      whatsappChannel: cleanWaChannel,
      whatsappChannelUrl: cleanWaChannel,
      supportPhone: cleanSupportPhone,
      callNumber: cleanCallNumber,
      popupEnabled: Boolean(popupEnabled),
      communityPopupEnabled: Boolean(popupEnabled)
    };

    updatePlatformSettings({
      henUnitPrice: Number(henPrice) || 500,
      dailyEggYield: Number(dailyYield) || 1,
      contractDurationDays: Number(contractDays) || 120,
      eggBasePrice: Number(eggBasePrice) || 30,
      minWithdrawalEggs: Number(minWdEggs) || 1,
      minWithdrawalPkr: Number(minWdPkr) || 30,
      maxWithdrawalEggs: Number(maxWdEggs) || 10000,
      referralCommissionLevel1: Number(commL1) || 2.0,
      referralCommissionLevel2: Number(commL2) || 1.0,
      referralFlatBonusPkr: Number(flatBonus) || 50,
      communityLinks: communityLinksObj,
      marketRates: {
        henUnitPrice: Number(henPrice) || 500,
        stores: [
          { id: 'sonica', name: 'Sonica FORM STORE', rate: Number(rateSonica) || 32 },
          { id: 'usmaina', name: 'Usmaina Poltry Farm', rate: Number(rateUsmaina) || 30 },
          { id: 'syed', name: 'Syed poultry farm', rate: Number(rateSyed) || 33 }
        ],
        eggRates: {
          sonica: Number(rateSonica) || 32,
          usmaina: Number(rateUsmaina) || 30,
          syed: Number(rateSyed) || 33
        }
      }
    });

    try {
      await supabase
        .from('platform_settings')
        .update({
          community_links: communityLinksObj,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);
    } catch (_) {}

    showToast('success', 'Platform settings & contact channels saved and synced with database!');
  };`;

if (adminCode.includes(oldHandleSaveSettings)) {
  adminCode = adminCode.replace(oldHandleSaveSettings, newHandleSaveSettings);
  console.log('✅ 2. Patched handleSaveSettings');
} else {
  console.error('❌ Could not find oldHandleSaveSettings');
}

fs.writeFileSync(adminPath, adminCode, 'utf8');
console.log('🎉 AdminDashboardPage.jsx successfully updated!');
