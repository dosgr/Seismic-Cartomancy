[Ελληνικά](SUPPORT.el.md)

# Optional support configuration

Edit the single `donate-config.js` beside `index.html`. Both languages use it. Reload the page after saving. Set `support: true` and enable each desired method separately via its `enabled` flag. A method also needs a matching destination and local PNG QR path under `assets/support/qr/`. Set `professional: false` to hide the independent dos.gr card. The personal package enables Bitcoin, Revolut, Facebook Subscription and the dos.gr card. PayPal starts disabled and can be enabled later. The support panel starts collapsed.

The public release disables payment options and has empty destinations and no payment QR codes. The personal deployment ZIP includes the destinations and verified QR codes. On a public static host, anyone who knows the path can retrieve static configuration and QR files even if the interface hides them. Deploy the public configuration first if you need to keep the destinations private until activation.

## Provider requirements

- **Revolut** distinguishes personal Revolut.Me use from business activity. Confirm whether creator support requires Pro or Business and whether the chosen link is eligible. [Greek Personal Terms](https://www.revolut.com/en-GR/legal/terms/) · [Pro terms](https://www.revolut.com/en-GR/legal/pro/).
- **PayPal** distinguishes personal and commercial PayPal.Me links and may require prior approval for covered gaming activities, including games with an entry fee and a prize. Confirm the correct account/link category and obtain clarification if the cartomancy presentation raises doubts. Seismic Cartomancy has no entry fee, monetary prize or participation benefit for supporters. [PayPal.Me terms](https://www.paypal.com/gr/legalhub/paypal/paypalme-tnc) · [Acceptable use](https://www.paypal.com/gr/legalhub/paypal/acceptableuse-full).
- **Facebook** handles recurring monthly subscriptions. Its creator eligibility, monetization policies and subscription terms apply. Facebook displays current pricing and manages billing. [Meta's creator guidance](https://ky-kg.facebook.com/business/learn/lessons/reward-fans-add-revenue-fan-subscriptions).
- **Bitcoin** is a direct address link in the form of text and QR. A valid Bech32 checksum and a matching QR do not establish ownership.

This review does not establish provider approval for any account. [Seismic-provider restrictions](HCKE.md) remain documented separately.
