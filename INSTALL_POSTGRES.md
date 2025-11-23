# Install PostgreSQL Locally - Step by Step

Follow these commands exactly. You'll need your Mac admin password.

## Step 1: Install Homebrew

Open a NEW Terminal window (not the one running npm dev) and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**What will happen:**
- It will ask for your password (you won't see it as you type - this is normal)
- It will download and install Homebrew (takes 2-5 minutes)
- At the end, it might show commands to add Homebrew to your PATH

**If it shows PATH commands at the end, run them!** They look like:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## Step 2: Verify Homebrew is Installed

```bash
brew --version
```

Expected output: `Homebrew 4.x.x`

## Step 3: Install PostgreSQL

```bash
brew install postgresql@15
```

This takes 3-5 minutes. Let it finish.

## Step 4: Start PostgreSQL Service

```bash
brew services start postgresql@15
```

Expected output: `Successfully started postgresql@15`

## Step 5: Create Database

```bash
createdb lekhai_dev
```

If this works, you should see no output (which is good!).

## Step 6: Verify Database Exists

```bash
psql -l
```

You should see `lekhai_dev` in the list.

---

## After Installation Complete

Come back to this terminal and tell me "Done". I'll then:
1. Update your .env file automatically
2. Run migrations
3. Get you ready for API keys

---

## Troubleshooting

**"command not found: brew"**
- Close and reopen Terminal
- Or run: `eval "$(/opt/homebrew/bin/brew shellenv)"`

**"createdb: command not found"**
- Run: `brew link postgresql@15`
- Then try createdb again

**"could not connect to server"**
- Run: `brew services restart postgresql@15`
- Wait 10 seconds and try again
