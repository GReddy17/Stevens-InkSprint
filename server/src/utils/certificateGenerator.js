import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CERTS_DIR = path.join(__dirname, '..', '..', 'public', 'certs')

// Use system font - Verdana on macOS, Noto on Linux (Docker)
const FONT_PATH = process.platform === 'darwin'
  ? '/System/Library/Fonts/Supplemental/Verdana.ttf'
  : process.env.DOCKER
    ? '/usr/share/fonts/noto/NotoSans-Regular.ttf'
    : '/usr/share/fonts/noto/NotoSans-Regular.ttf'

export async function generateCertificate({
  contestTitle,
  participantName,
  placement,
  date,
  submissionId
}) {
  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true })
  }

  const safeName = participantName.replace(/[^a-zA-Z0-9]/g, '_')
  const safeContest = contestTitle.replace(/\s+/g, '_').toLowerCase()
  const filename = `${safeContest}_${placement}_${safeName}_${submissionId}.png`
  const outputPath = path.join(CERTS_DIR, filename)

  const placementText = placement === 1 ? '1st Place' : placement === 2 ? '2nd Place' : placement === 3 ? '3rd Place' : `${placement}th Place`

  // Build command with escaped strings for shell
  const fontArg = `-font "${FONT_PATH}"`
  const cmd = `magick -size 800x600 xc:white ${fontArg} -fill "#1e3a5f" -pointsize 24 -gravity center -annotate +0-240 "InkSprint Writing Contest" -fill "#1e3a5f" -pointsize 48 -annotate +0-160 "Certificate of Achievement" -fill "#333333" -pointsize 32 -annotate +0-80 "This certifies that" -fill "#d4af37" -pointsize 42 -annotate +0-20 "${participantName}" -fill "#333333" -pointsize 28 -annotate +0+40 "has won ${placementText}" -annotate +0+80 "in ${contestTitle}" -fill "#666666" -pointsize 20 -annotate +0+160 "Date: ${date}" "${outputPath}"`

  try {
    await execAsync(cmd, { shell: '/bin/sh' })
    return `/certs/${filename}`
  } catch (error) {
    console.error('Certificate generation failed:', error.message)
    console.error('Command was:', cmd)
    throw new Error('Failed to generate certificate')
  }
}