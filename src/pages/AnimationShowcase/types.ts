/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppState {
    IDLE = 'IDLE',
    CHECKING_KEY = 'CHECKING_KEY',
    GENERATING_IMAGE = 'GENERATING_IMAGE',
    GENERATING_VIDEO = 'GENERATING_VIDEO',
    PLAYING = 'PLAYING',
    ERROR = 'ERROR'
}

export interface GenerationResult {
    imageUrl?: string;
    videoUrl?: string;
}
