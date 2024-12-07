import bcrypt from 'bcrypt';

export const validatePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch; 
  } catch (error) {
    console.error('Error al validar la contraseña:', error);
    return false;
  }
};