# ☄ Polkadot Substrate Interface

<div align="center">

![Polkadot Parachain Interface Logo](https://github.com/user-attachments/assets/88a8d34f-604c-45b5-9c92-cf14464a7a87)

**A sleek, futuristic, and user-friendly interface for interacting with Substrate-based blockchains on any platform.**

</div>

---

## ✨ Features

- **🌍 Flexible Network Connection** – Easily connect to Polkadot, Kusama, Westend, or your custom local Zombienet nodes.
- **🔍 Chain State Explorer** – View and query on-chain storage with an intuitive UI.
- **📝 Submit Extrinsics** – Craft and send transactions with dynamic parameter input.
- **💸 Token Transfers** – Send tokens effortlessly via a clean and straightforward interface.
- **🔐 Multi-Wallet Support** – Compatible with both Polkadot.js and SubWallet browser extensions.
- **📱 Responsive Design** – Seamlessly optimized for both desktop and mobile devices.

---

## 🚀 Getting Started

### Prerequisites

Make sure the following tools are installed:

- Node.js v16+
- npm or yarn
- [Polkadot.js browser extension](https://polkadot.js.org/extension/)
- Zombienet & Pop CLI (for local Substrate testing)

---

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GustuRyan/substrate-dev-template.git
   cd polkadot-parachain-interface
   code .
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn run dev
   ```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Installing Pop CLI

Pop CLI helps you spawn local Substrate chains using Zombienet.

### Steps:

1. Ensure you have [Go](https://go.dev/doc/install) and [Rust](https://www.rust-lang.org/tools/install) installed.
2. Clone the Polkadot SDK repo:
   ```bash
   git clone https://github.com/paritytech/polkadot-sdk.git
   cd polkadot-sdk
   ```

3. Install Pop CLI via Cargo:
   ```bash
   cargo install --force --path pop/cli
   ```

4. Verify the installation:
   ```bash
   pop --version
   ```

---

## 💻 Development

### Connect to Different Networks

From the homepage, use the **Network Selector** to:

1. Choose a preset network (Polkadot, Kusama, Westend)
2. Enter a custom WebSocket endpoint (e.g., your local Zombienet node)

> ⚠️ Note: Zombienet generates a new WebSocket port every time it runs. Make sure you update the endpoint accordingly.

### Using with Local Zombienet

1. Launch Zombienet using the `pop` command.
2. Copy the WebSocket URL from the terminal (e.g., `ws://127.0.0.1:55308`)
3. Start the Nuxt dev server (`npm run dev`)
4. Input the WebSocket URL in the Network Selector to connect

---

## 🌐 Deployment

The app is pre-configured for smooth deployment using Vercel or Netlify.

### Deploying to Vercel

1. Fork this repository
2. Sign up at [vercel.com](https://vercel.com) and connect your GitHub
3. Create a new project from the forked repo
4. Set the build options:
   - **Build Command**: `npm run build` or `yarn build`
   - **Publish Directory**: `build`
5. Add environment variable:
   ```bash
   NUXT_APP_WS_ENDPOINT=wss://westend-rpc.polkadot.io
   ```
6. Deploy 🚀

> ⚠️ Note: Browsers block local WebSocket connections in deployed apps. Use public endpoints like Westend for testing the deployed version.

---

## 🎨 Customizing the Interface

You can personalize the interface by replacing images in the following directories:

- **Logo**: Replace `public/logo.png` and `public/logo192.png`
- **UI Screenshot**: Update `docs/images/interface-screenshot.png`
- **Favicon**: Replace `public/favicon.ico`

---

## 📖 Resources

Want to dive deeper into Substrate and Polkadot development? Check out:

- [Polkadot.js Documentation](https://polkadot.js.org/docs/)
- [Polkadot Wiki](https://wiki.polkadot.network/)

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more info.

---

## 🙌 Acknowledgments

Special thanks to:

- [Polkadot.js](https://polkadot.js.org/) – for the powerful API & tools
- [Zombienet](https://docs.polkadot.com/tutorials/polkadot-sdk/testing/spawn-basic-chain/) – for enabling smooth local blockchain testing

