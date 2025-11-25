"use client"

import { useState } from "react"
import { Download, AlertTriangle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { convertCsvToLua } from "@/lib/converter"

// Installation instructions for the modal
const INSTALLATION_STEPS = [
  "Open your Planet Coaster 2 folder and navigate to Win64/ovldata",
  <p key="step-2">Move your <code className="bg-ctp-surface1 px-1 rounded">coaster.lua</code> file into the Mod_Importer folder</p>,
  "Restart or open Planet Coaster",
  <p key="step-4">Open your level and create a coaster with a simple straight track 4 meters in length.
    <br /><strong>Do not close the coaster editor</strong></p>,
  "Click the PC:CC button",
  "Click accept to import your coaster!"
]

export default function CoasterConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [enableHeartline, setenableHeartline] = useState(true)
  // 1.1m is fvd's default heartline value, most users will probably forget to change this so a sane deafult is probably ideal
  const [heartlineAmountString, setHeartlineAmountString] = useState('1.1')
  const [heartlineAmount, setHeartlineAmount] = useState(1.1)
  // If segment length is set, resample the result of heartlining to preserve event segment lengths
  const [segmentLengthString, setSegmentLengthString] = useState('2')
  const [segmentLength, setSegmentlength] = useState(2)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
  }

  const handleChangeEnableHeartline = (e: React.ChangeEvent<HTMLInputElement>) => {
    setenableHeartline(e.target.checked)
  }

  const handleChangeHeartlineValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '-') {
      // User typing negative number
      setHeartlineAmountString(`${e.target.value}`)
      setHeartlineAmount(0)
      return
    }
    
    const value = parseFloat(e.target.value)

    if (!isNaN(value)) {
      if (value > 10)  {
        setHeartlineAmount(10)
        setHeartlineAmountString(`10`)
      } else {
        setHeartlineAmount(value)
        if (e.target.value[e.target.value.length - 1] === '.') {
          setHeartlineAmountString(`${e.target.value}`)
        } else {
          setHeartlineAmountString(`${value}`)
        }
      }
    } else {
      setHeartlineAmountString('')
      setHeartlineAmount(0)
    }
  }

  const handleChangeSegmentLength = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      if (value >= 100) {
        setSegmentlength(100)
        setSegmentLengthString('100')
      } else {
        setSegmentlength(value)
        if (e.target.value[e.target.value.length - 1] === '.') {
          setSegmentLengthString(`${e.target.value}`)
        } else {
          setSegmentLengthString(`${value}`)
        }
      }
    } else {
      setSegmentlength(0)
      setSegmentLengthString('')
    }
  }

  const handleConvert = async () => {
    if (!file) return

    setIsConverting(true)

    try {
      // Read the CSV file content
      const csvContent = await file.text()

      // Convert CSV to Lua using the real converter
      const convertedContent = convertCsvToLua(csvContent, enableHeartline, heartlineAmount, segmentLength)

      // Create and download the converted file
      const blob = new Blob([convertedContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "coaster.lua"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setShowInstructions(true)
    } catch (error) {
      console.error('Conversion failed:', error)
      alert('Conversion failed. Please make sure you selected a valid No Limits 2 CSV file.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl flex-1">
        {/* Website Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-ctp-text mb-2">Planet Coaster (2) : Coaster Converter</h1>
          <p className="text-ctp-subtext1">PC:CC</p>
        </div>

        {/* Warning Box */}
        <Alert className="mb-8 border-ctp-yellow bg-ctp-yellow/10 transition-all duration-500 hover:shadow-[0_0px_25px_-3px_var(--tw-shadow-color)] hover:shadow-ctp-yellow/25">
          <AlertTriangle className="h-4 w-4 text-ctp-yellow" />
          <AlertDescription className="text-ctp-text">
            <strong>Beta Warning:</strong> This mod is still in beta and may cause game crashes and other issues. Please
            save and backup your worlds often to avoid data loss.
          </AlertDescription>
        </Alert>

        {/* Conversion Card */}
        <Card className="bg-ctp-mantle border-ctp-surface0 hover:border-ctp-mauve transition-all duration-500 hover:shadow-[0_0px_25px_-3px_var(--tw-shadow-color)] hover:shadow-ctp-mauve/25">
          <CardHeader>
            <CardTitle className="text-ctp-text flex items-center gap-2">
              <FileText className="h-5 w-5 text-ctp-mauve" />
              Convert Your Coaster File
            </CardTitle>
            <CardDescription className="text-ctp-subtext1">
              Upload your Planet Coaster file to convert it for use in Planet Coaster 2
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Simple File Input */}
            <div className="space-y-4">
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                accept=".csv,.tsv"
                className="w-full cursor-pointer text-sm text-ctp-text bg-ctp-crust border border-ctp-surface0 rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-ctp-base file:text-ctp-text hover:file:bg-ctp-surface0 file:cursor-pointer transition-all hover:shadow-[0_0px_25px_-3px_var(--tw-shadow-color)] hover:shadow-ctp-crust"
              />
            </div>
              <div className="flex flex-row items-start space-x-2 py-1 px-3 hover:bg-ctp-surface0 transition-all rounded">
                <div className="mr-3">
                  <input
                    id="apply-heartline"
                    type="checkbox"
                    onChange={handleChangeEnableHeartline}
                    value={`${enableHeartline}`}
                    checked={enableHeartline}
                    className="cursor-pointer block relative top-1.5"
                  />
                </div>
                  <label htmlFor="apply-heartline" className="block mb-1 bold cursor-pointer block space-y-3 w-full">
                    <div>
                      <p className="mb-1">Apply Heartlining</p>
                      <p className="text-ctp-subtext0 text-sm">(Use this option if the csv file does not include heartline data)</p>
                    </div>
                </label>
              </div>
            

            <div className={`${enableHeartline ? '' : 'hidden'} space-y-2`}>
              <div className="space-y-3">
                <label className="text-ctp-subtext1 mb-2 block">Heartline Amount (m):</label>
                <input
                  id="heartline"
                  type="string"
                  onChange={handleChangeHeartlineValue}
                  value={heartlineAmountString}
                  className="w-full p-2 text-sm text-ctp-text bg-ctp-crust border border-ctp-surface0 rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-ctp-base file:text-ctp-text hover:file:bg-ctp-surface0 transition-all hover:shadow-[0_0px_25px_-3px_var(--tw-shadow-color)] hover:shadow-ctp-crust"
                />
              </div>

              <div className="space-y-3">
                <label className="text-ctp-subtext1 mb-2 block">Segment Length (m):</label>
                <input
                  id="segment-length"
                  type="string"
                  onChange={handleChangeSegmentLength}
                  value={segmentLengthString}
                  className="w-full p-2 text-sm text-ctp-text bg-ctp-crust border border-ctp-surface0 rounded-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-ctp-base file:text-ctp-text hover:file:bg-ctp-surface0 transition-all hover:shadow-[0_0px_25px_-3px_var(--tw-shadow-color)] hover:shadow-ctp-crust"
                />
              </div>
            </div>

            {/* Convert Button */}
            <Button
              onClick={handleConvert}
              disabled={!file || isConverting}
              className={`${!file || isConverting ? '' : 'cursor-pointer'} mt-4 w-full bg-ctp-mauve text-ctp-base font-medium py-2 transition-all hover:scale-102 active:scale-98 hover:shadow-[0_0px_25px_-3px_var(--tw-shadow-color)] hover:shadow-ctp-mauve/25`}
            >
              {isConverting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-ctp-base border-t-transparent mr-2" />
                  Converting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Convert & Download
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        <p className="mt-4 text-sm text-ctp-subtext1 text-center">
          All conversions are done locally in your browser. No data is sent to any server.
          <br />
          View the source code <a target="_blank" href="https://github.com/parker02311/PC-CC/" className="text-ctp-mauve hover:text-ctp-pink transition-all">here</a>.
        </p>
      </main>

      {/* Instructions Modal */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="bg-ctp-mantle border-ctp-surface0 text-ctp-text max-w-md hover:border-ctp-mauve transition-all duration-500 hover:shadow-[0_0px_25px_-3px_var(--tw-shadow-color)] hover:shadow-ctp-mauve/25">
          <DialogHeader>
            <DialogTitle className="text-ctp-text">Installation Instructions</DialogTitle>
            <DialogDescription className="text-ctp-subtext1">
              Follow these steps to import your converted coaster:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <ol className="space-y-3 text-sm">
              {INSTALLATION_STEPS.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-ctp-mauve text-ctp-base rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <Button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-ctp-mauve hover:bg-ctp-mauve/90 text-ctp-base"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

