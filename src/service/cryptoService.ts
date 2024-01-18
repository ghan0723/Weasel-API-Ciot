import * as crypto from 'crypto';

class CryptoService {
    private izkey: string;

    constructor(izkey: string) {
        this.izkey = izkey;
    }

    private getRandom(length: number): string {
        const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString: string = '';

        for (let i: number = 0; i < length; i++) {
            const randomIndex: number = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
        }

        return randomString;
    }

    private getRandomNumberSequence(length: number): string {
        if (length < 1) {
            throw new Error('길이는 1 이상이어야 합니다.');
        }

        let result: string = '';

        for (let i: number = 0; i < length; i++) {
            const randomNumber: number = Math.floor(Math.random() * 9) + 1;
            result += randomNumber.toString();
        }

        return result;
    }

    private insertString(originalString: string, position: number, insertion: string, isFront: boolean): string {
        try {
            if (position < 0 || position > originalString.length) {
                throw new Error('유효하지 않은 삽입 위치입니다.');
            }

            if (isFront) {
                return originalString.slice(0, position) + insertion + originalString.slice(position);
            } else {
                return originalString.slice(0, -position) + insertion + originalString.slice(-position);
            }
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }

    private cutString(originalString: string, position: number, length: number, fromFront: boolean): { cutPart: string, remainingPart: string } {
        try {
            if (position < 0 || position > originalString.length) {
                throw new Error('유효하지 않은 자르기 위치입니다.');
            }

            if (length < 0 || length > originalString.length - position) {
                throw new Error('유효하지 않은 길이입니다.');
            }

            if (fromFront) {
                const cutPart: string = originalString.slice(position, position + length);
                const remainingPart: string = originalString.slice(0, position) + originalString.slice(position + length);
                return { cutPart, remainingPart };
            } else {
                const cutPart: string = originalString.slice(-position - length, -position);
                const remainingPart: string = originalString.slice(0, -position - length) + originalString.slice(-position);
                return { cutPart, remainingPart };
            }
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }

    private encrypt(text: string, key: string): { iv: string; encryptedData: string } {
        try {
            const iv: Buffer = crypto.randomBytes(16);
            const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);

            let encrypted: string = cipher.update(text, 'utf-8', 'hex');
            encrypted += cipher.final('hex');

            return { iv: iv.toString('hex'), encryptedData: encrypted };
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }

    private decrypt(encryptedData: string, key: string, iv: string): string {
        try {
            const decipher: crypto.Decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv, 'hex'));

            let decrypted: string = decipher.update(encryptedData, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');

            return decrypted;
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }

    public getEncrypt(dataToEncrypt: string, secretKey: string): { iv: string; encryptedData: string } {
        try {
            const { iv, encryptedData } = this.encrypt(dataToEncrypt, secretKey);
            return { iv, encryptedData };
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }

    public getDecrypt(encryptedData: string, secretKey: string, iv: string): string {
        try {
            const decryptedData: string = this.decrypt(encryptedData, secretKey, iv);
            return decryptedData;
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }

    public getEncryptUltra(data: string): string {
        try {
            let key12: string = this.getRandom(12);
            let secretKey: string = this.izkey.slice(0, 10);
            secretKey += key12;
            secretKey += this.izkey.slice(10, 20);

            let edata: { iv: string, encryptedData: string } = this.getEncrypt(data, secretKey);

            let cal: string = edata.encryptedData;
            let iv: string = edata.iv;
            let secret1: string = this.getRandomNumberSequence(1);
            let secret2: string = this.getRandomNumberSequence(2);

            cal += secret1;
            const modifiedString_iv: string = this.insertString(cal, parseInt(secret2.slice(1, 2)), iv, true);
            const modifiedString_secretKey: string = this.insertString(modifiedString_iv, parseInt(secret2.slice(0, 1)), key12, false);
            const modifiedString: string = this.insertString(modifiedString_secretKey, parseInt(secret1), secret2, false);

            return modifiedString;
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }

    public getDecryptUltra(data: string): string {
        try {
            let nums: string = data.slice(-1);

            const modifiedString: { cutPart: string, remainingPart: string } = this.cutString(data, parseInt(nums), 2, false);
            const modifiedString_secretKey: { cutPart: string, remainingPart: string } = this.cutString(modifiedString.remainingPart, parseInt(modifiedString.cutPart.slice(0, 1)), 12, false);
            const modifiedString_iv: { cutPart: string, remainingPart: string } = this.cutString(modifiedString_secretKey.remainingPart, parseInt(modifiedString.cutPart.slice(1, 2)), 32, true);

            let secretKey: string = this.izkey.slice(0, 10);
            secretKey += modifiedString_secretKey.cutPart;
            secretKey += this.izkey.slice(10, 20);

            const decryptedData: string = this.getDecrypt(modifiedString_iv.remainingPart.slice(0, modifiedString_iv.remainingPart.length - 1), secretKey, modifiedString_iv.cutPart);

            return decryptedData;
        } catch (error) {
            console.error('오류:', error);
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
}

export default CryptoService;
