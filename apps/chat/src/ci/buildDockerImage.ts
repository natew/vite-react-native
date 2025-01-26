import { info, setFailed } from '@actions/core'
import { exec } from '@actions/exec'

export async function buildDockerImage({
  image,
  context,
  githubActor,
  githubToken,
}: { image: string; context: string; githubActor: string; githubToken: string }) {
  const imageName = `ghcr.io/onejs/one/chat-app`
  const tag = 'latest'

  try {
    // login
    await exec('docker', ['login', 'ghcr.io', '-u', githubActor, '-p', githubToken])

    // build
    await exec('docker', ['build', '-f', image, '-t', `${imageName}:${tag}`, context])

    // push
    await exec('docker', ['push', `${imageName}:${tag}`])

    info(`Successfully pushed ${imageName}:${tag} to GHCR`)

    return `${imageName}:${tag}`
  } catch (error) {
    setFailed(`Failed to build and push Docker image: ${(error as any).message}`)
    throw error
  }
}
