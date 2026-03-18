export const XOR_KEY = "ALTAR_SYSTEM_SECRET_KEY_2026";

/**
 * Basic XOR encryption/decryption with Base64 encoding.
 * Used to obfuscate the local storage data to prevent casual editing.
 */
export const obfuscateData = (data: string): string => {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return btoa(encodeURIComponent(result));
};

export const deobfuscateData = (encodedData: string): string => {
  try {
    const data = decodeURIComponent(atob(encodedData));
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return result;
  } catch (e) {
    console.error("Failed to decode data:", e);
    return "";
  }
};
