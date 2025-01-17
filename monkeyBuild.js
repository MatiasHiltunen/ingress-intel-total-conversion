import { rmSync, readFileSync, readdirSync, writeFileSync } from 'fs'

const outfile = 'total-conversion-build.js'
const author = "Matias Hiltunen"
const version = "0.0.1"
const baseUrl = "http://127.0.0.1:8080/"
const userMetaPath = "total-conversion-build.meta.js"
export const userScriptPath = "total-conversion-build.user.js"
export const outDir = './build'
const updateUrl = baseUrl + userMetaPath
const downloadUrl = baseUrl + userScriptPath

const monkeyMeta = `// ==UserScript==
// @author         ${author}
// @name           IITC: Ingress intel map total conversion - TypeScript Edition
// @version        ${version}
// @description    Total conversion for the ingress intel map.
// @run-at         document-end
// @id             total-conversion-build-ts
// @namespace      https://github.com/MatiasHiltunen/IITC-TypeScript-Edition
// @updateURL      ${updateUrl}
// @downloadURL    ${downloadUrl}
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==`

const transpiledTsFile = outDir + '/' + outfile
const monkeyHeader = (script) => `${monkeyMeta}

if (typeof GM_info !== 'undefined' && GM_info && GM_info.script){const script = document.createElement('script');const info = {script: { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description }};script.appendChild(document.createTextNode(((plugin_info) => {${script}})(JSON.stringify(info))));(document.body || document.head || document.documentElement).appendChild(script);}`



export const buildMonkeyScript = () => {

    const fileContent = monkeyHeader(readFileSync(transpiledTsFile, 'utf-8'))

    if (readdirSync(outDir).includes(userScriptPath)) rmSync(outDir + '/' + userScriptPath)
    writeFileSync(outDir + '/' + userScriptPath, fileContent)

    if (readdirSync(outDir).includes(userMetaPath)) rmSync(outDir + '/' + userMetaPath)
    writeFileSync(outDir + '/' + userMetaPath, monkeyMeta)
}