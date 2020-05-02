---- API USES ----

Users

Clients are considered users in the API context. A client must create an account that is supported by a user post method.

When a client creates an account, an unique shopping cart object is created and automatically associated with its account.

A client can query all its data: orders,  shopping cart, and personal information.

Clients can also update their personal data, but can not delete its shopping cart ou change placed orders information.

Clients can delete their account. Its orders don't get deleted for they remain in a separate data collection. Company policy is to keep all orders history for data-driven business decisions. After deletion, the client's orders can't be traced back to it, though.

Menu & Shopping Cart

Once started a session, through a token post method, the clients can view the menu options. They can choose from the menu not only pizza flavors, but also sizes, drinks, and desserts. It's also possible to make free comments in each item to specify preferences such as "extra onions" or "no onions". An item is a JSON object which makes the shopping cart a collection of JSON objects.

Ordering 

When a client places an order, all items currently added to the shopping cart become this order and its amount is the sum of all items. Each order receives its identifier. After confirming the payment with Stripe's API, this identifier is pushed into the client's order history and the order is saved on its own collection.

In parallel, an e-mail is sent to the client via MailGun API. You don't wanna lose the deal because the e-mail servers might be down, so the order gets the information about the e-mailing procedure: it might be true or false, but order placement and delivery won't be affected by this.