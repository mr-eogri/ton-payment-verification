/**
 * Simple logging utility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private enabled: boolean;
  private level: LogLevel;

  constructor(enabled: boolean = false, level: LogLevel = 'info') {
    this.enabled = enabled;
    this.level = level;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, data?: any): void {
    if (!this.enabled || this.level !== 'debug') return;
    console.log(`[DEBUG] ${message}`, data || '');
  }

  info(message: string, data?: any): void {
    if (!this.enabled) return;
    console.log(`[INFO] ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    if (!this.enabled) return;
    console.warn(`[WARN] ${message}`, data || '');
  }

  error(message: string, data?: any): void {
    if (!this.enabled) return;
    console.error(`[ERROR] ${message}`, data || '');
  }
}
