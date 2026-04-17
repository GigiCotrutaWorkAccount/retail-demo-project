// Salesforce Data Cloud Integration

export const initSalesforce = () => {
  if (window.SalesforceInteractions) {
    SalesforceInteractions.init({
      consents: [
        { 
          purpose: SalesforceInteractions.ConsentPurpose.Tracking, 
          provider: "OneTrust", 
          status: SalesforceInteractions.ConsentStatus.OptIn 
        }
      ]
    });

    SalesforceInteractions.setLoggingLevel(4);

    SalesforceInteractions.sendEvent({
      interaction: {
        name: "UTMTracking",
        processType: "view"
      }
    });
  }
};

// Functions to send events based on the JSON schema
export const sendShoppingCartEngagement = (data) => {
  // data should match ShoppingCartEngagement fields
  if (window.SalesforceInteractions) {
    SalesforceInteractions.sendEvent({
      interaction: {
        name: "ShoppingCartEngagement",
        ...data
      }
    });
  }
};

export const sendShoppingCartProductEngagement = (data) => {
  if (window.SalesforceInteractions) {
    SalesforceInteractions.sendEvent({
      interaction: {
        name: "ShoppingCartProductEngagement",
        ...data
      }
    });
  }
};

export const sendProductOrderEngagement = (data) => {
  if (window.SalesforceInteractions) {
    SalesforceInteractions.sendEvent({
      interaction: {
        name: "ProductOrderEngagement",
        ...data
      }
    });
  }
};