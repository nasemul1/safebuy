export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  console.log(`Verification email would be sent to ${email} with token ${token}`);
}
