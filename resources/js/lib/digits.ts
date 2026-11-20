/**
 * Keep only the digits of a DNI/CUIT or phone value, e.g. "+54 9 387 512-3456" -> "5493875123456".
 * The server applies the same normalization before validating.
 */
export function onlyDigits(value: string | null | undefined): string {
    return (value ?? '').replace(/\D/g, '');
}

export const DNI_DIGITS = { min: 7, max: 11 } as const;
export const PHONE_DIGITS = { min: 8, max: 15 } as const;

export const DNI_DIGITS_MESSAGE = 'El DNI o CUIT debe contener solo números (7 a 11 dígitos).';
export const PHONE_DIGITS_MESSAGE = 'El teléfono debe contener solo números (8 a 15 dígitos).';
