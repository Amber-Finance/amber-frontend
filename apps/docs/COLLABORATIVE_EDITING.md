# Collaborative Editing System

This documentation site now includes a wallet-based collaborative editing system that allows approved contributors to suggest changes to the documentation.

## Features

### 🔐 Wallet Authentication
- Connect with any Cosmos wallet (Keplr, Leap, Cosmostation, etc.)
- Cryptographic signature verification for all actions
- Transparent user identification via wallet addresses

### 📝 Edit Proposals
- Submit edit proposals with side-by-side diff view
- All proposals are cryptographically signed
- Proposals include original and proposed content
- Timestamped and attributed to specific wallet addresses

### 👥 Permission System
- **Viewers**: Can read documentation (all connected users)
- **Approved Contributors**: Can submit edit proposals
- **Admins**: Can approve/reject proposals and manage the system

### 🔍 Review Process
- Admins can review all pending proposals
- Side-by-side comparison of original vs proposed content
- One-click approve/reject with cryptographic signatures
- Complete audit trail of all changes

## Setup

### 1. Configure Approved Contributors

Edit `apps/docs/src/components/common/ConnectButton.tsx` and add wallet addresses:

```typescript
const APPROVED_CONTRIBUTORS = [
  'neutron1...', // Add Gizhib's address
  'neutron1...', // Add other approved contributors
]

const ADMIN_ADDRESSES = [
  'neutron1...', // Add Gizhib's address for admin access
]
```

### 2. Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

### 3. Backend Integration (Future)

Currently, the system stores proposals in memory. For production, you'll want to:

1. **Database Storage**: Store proposals in a database
2. **File System Integration**: Automatically apply approved changes to MDX files
3. **Git Integration**: Create pull requests for approved changes
4. **Notification System**: Alert admins of new proposals

## Usage

### For Contributors

1. **Connect Wallet**: Click "Connect Wallet" in the navbar
2. **Submit Proposal**: Click "Suggest Edit" in the user menu
3. **Edit Content**: Make your changes in the side-by-side editor
4. **Sign & Submit**: Sign the proposal with your wallet
5. **Wait for Review**: Admins will review your proposal

### For Admins

1. **Connect Wallet**: Use an admin wallet address
2. **Review Proposals**: Click "Review Changes" to see pending proposals
3. **Approve/Reject**: Review each proposal and approve or reject
4. **Apply Changes**: Approved changes can be automatically applied

## Security Features

- **Cryptographic Signatures**: All actions require wallet signatures
- **Address Verification**: Only approved addresses can submit proposals
- **Audit Trail**: Complete history of who proposed what changes
- **Permission Levels**: Granular control over who can do what

## Technical Architecture

### Components

- `CosmosKitProvider`: Wallet connection and chain configuration
- `CollaborativeEditingProvider`: State management for proposals
- `ConnectButton`: Main wallet connection interface
- `EditProposalModal`: Interface for submitting proposals
- `ReviewProposalsModal`: Admin interface for reviewing proposals

### Data Flow

1. User connects wallet → Address verified against approved list
2. User submits proposal → Content signed with wallet
3. Proposal stored in context → Available for admin review
4. Admin reviews proposal → Approves/rejects with signature
5. Approved changes → Can be applied to file system

## Future Enhancements

- **Real-time Collaboration**: Live editing with multiple users
- **Version Control**: Git integration for change tracking
- **Comment System**: Discussion on specific proposals
- **Automated Testing**: Validate changes before approval
- **Notification System**: Email/Discord alerts for new proposals
- **Bounty System**: Reward contributors for accepted changes

## Development

### Running Locally

```bash
cd apps/docs
pnpm dev
```

### Testing the System

1. Connect with a test wallet
2. Add the wallet address to `APPROVED_CONTRIBUTORS`
3. Submit a test proposal
4. Connect with an admin wallet to review

### Customization

- Modify the permission system in `ConnectButton.tsx`
- Customize the UI in the modal components
- Add new features to the collaborative editing context
- Integrate with your preferred backend system

## Security Considerations

- Always verify wallet signatures on the backend
- Implement rate limiting for proposal submissions
- Consider implementing proposal expiration
- Add content validation to prevent malicious proposals
- Regular backup of proposal data

---

This system provides a foundation for community-driven documentation while maintaining security and quality control through cryptographic verification and admin oversight.
