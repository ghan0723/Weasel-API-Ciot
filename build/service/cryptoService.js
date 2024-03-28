"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
class CryptoService {
    // CryptoService 클래스의 생성자입니다. izkey 매개변수로 암호화 키를 받아 초기화합니다.
    constructor(izkey) {
        this.izkey = izkey;
    }
    // 지정된 길이만큼의 랜덤 문자열을 생성하는 private 메서드입니다.
    getRandom(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
        }
        return randomString;
    }
    // 지정된 길이만큼의 랜덤 숫자 시퀀스를 생성하는 private 메서드입니다.
    getRandomNumberSequence(length) {
        if (length < 1) {
            throw new Error('길이는 1 이상이어야 합니다.');
        }
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomNumber = Math.floor(Math.random() * 9) + 1;
            result += randomNumber.toString();
        }
        return result;
    }
    // 문자열을 지정된 위치에 삽입하는 private 메서드입니다.
    insertString(originalString, position, insertion, isFront) {
        try {
            if (position < 0 || position > originalString.length) {
                throw new Error('유효하지 않은 삽입 위치입니다.');
            }
            if (isFront) {
                return originalString.slice(0, position) + insertion + originalString.slice(position);
            }
            else {
                return originalString.slice(0, -position) + insertion + originalString.slice(-position);
            }
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
    // 문자열을 지정된 위치와 길이로 자르는 private 메서드입니다.
    cutString(originalString, position, length, fromFront) {
        try {
            if (position < 0 || position > originalString.length) {
                throw new Error('유효하지 않은 자르기 위치입니다.');
            }
            if (length < 0 || length > originalString.length - position) {
                throw new Error('유효하지 않은 길이입니다.');
            }
            if (fromFront) {
                const cutPart = originalString.slice(position, position + length);
                const remainingPart = originalString.slice(0, position) + originalString.slice(position + length);
                return { cutPart, remainingPart };
            }
            else {
                const cutPart = originalString.slice(-position - length, -position);
                const remainingPart = originalString.slice(0, -position - length) + originalString.slice(-position);
                return { cutPart, remainingPart };
            }
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
    // 주어진 텍스트를 주어진 키를 사용하여 암호화하는 private 메서드입니다.
    encrypt(text, key) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
            let encrypted = cipher.update(text, 'utf-8', 'hex');
            encrypted += cipher.final('hex');
            return { iv: iv.toString('hex'), encryptedData: encrypted };
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
    // 주어진 암호화된 데이터를 주어진 키와 초기화 벡터를 사용하여 복호화하는 private 메서드입니다.
    decrypt(encryptedData, key, iv) {
        try {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv, 'hex'));
            let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
            decrypted += decipher.final('utf-8');
            return decrypted;
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
    // 주어진 데이터를 주어진 비밀 키를 사용하여 암호화하고 결과를 반환하는 public 메서드입니다.
    getEncrypt(dataToEncrypt, secretKey) {
        try {
            const { iv, encryptedData } = this.encrypt(dataToEncrypt, secretKey);
            return { iv, encryptedData };
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
    // 주어진 암호화된 데이터를 주어진 비밀 키와 초기화 벡터를 사용하여 복호화하고 결과를 반환하는 public 메서드입니다.
    getDecrypt(encryptedData, secretKey, iv) {
        try {
            const decryptedData = this.decrypt(encryptedData, secretKey, iv);
            return decryptedData;
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
    // 주어진 데이터를 아주 강력한 암호화 방식으로 암호화하고 결과를 반환하는 public 메서드입니다.
    getEncryptUltra(data) {
        try {
            let key12 = this.getRandom(12);
            let secretKey = this.izkey.slice(0, 10);
            secretKey += key12;
            secretKey += this.izkey.slice(10, 20);
            let edata = this.getEncrypt(data, secretKey);
            let cal = edata.encryptedData;
            let iv = edata.iv;
            let secret1 = this.getRandomNumberSequence(1);
            let secret2 = this.getRandomNumberSequence(2);
            cal += secret1;
            const modifiedString_iv = this.insertString(cal, parseInt(secret2.slice(1, 2)), iv, true);
            const modifiedString_secretKey = this.insertString(modifiedString_iv, parseInt(secret2.slice(0, 1)), key12, false);
            const modifiedString = this.insertString(modifiedString_secretKey, parseInt(secret1), secret2, false);
            return modifiedString;
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
    // 주어진 아주 강력하게 암호화된 데이터를 복호화하고 결과를 반환하는 public 메서드입니다.
    getDecryptUltra(data) {
        try {
            let nums = data.slice(-1);
            const modifiedString = this.cutString(data, parseInt(nums), 2, false);
            const modifiedString_secretKey = this.cutString(modifiedString.remainingPart, parseInt(modifiedString.cutPart.slice(0, 1)), 12, false);
            const modifiedString_iv = this.cutString(modifiedString_secretKey.remainingPart, parseInt(modifiedString.cutPart.slice(1, 2)), 32, true);
            let secretKey = this.izkey.slice(0, 10);
            secretKey += modifiedString_secretKey.cutPart;
            secretKey += this.izkey.slice(10, 20);
            const decryptedData = this.getDecrypt(modifiedString_iv.remainingPart.slice(0, modifiedString_iv.remainingPart.length - 1), secretKey, modifiedString_iv.cutPart);
            return decryptedData;
        }
        catch (error) {
            throw error; // 에러가 발생하면 다시 던집니다.
        }
    }
}
exports.default = CryptoService;
