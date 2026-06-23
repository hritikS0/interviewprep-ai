import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Layout'

const testCases = [
  { id: 1, input: '[2, 7, 11, 15], target = 9', expected: '[0, 1]', passed: true },
  { id: 2, input: '[3, 2, 4], target = 6', expected: '[1, 2]', passed: true },
  { id: 3, input: '[3, 3], target = 6', expected: '[0, 1]', passed: null },
  { id: 4, input: '[1, 5, 8, 3], target = 9', expected: '[0, 2]', passed: null },
]

export default function CodingRound() {
  const [code, setCode] = useState(`function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }

  return [];
}`)
  const [language, setLanguage] = useState('TypeScript')

  const passed = testCases.filter((t) => t.passed === true).length
  const failed = testCases.filter((t) => t.passed === false).length

  return (
    <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#09090B] overflow-hidden select-none font-sans transition-colors duration-200">
      {/* Global Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 ml-60 flex h-full bg-[#FAFAF9] dark:bg-[#09090B] overflow-hidden">
        {/* Left Column - Problem */}
        <div className="w-[440px] border-r border-border bg-surface overflow-auto flex flex-col transition-colors duration-200">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <Link to="/dashboard" className="text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors">
              Exit
            </Link>
            <span className="text-[12px] font-semibold text-text-secondary bg-[#F3F4F6] dark:bg-[#27272A] px-2.5 py-0.5 rounded-full">
              45 min
            </span>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold text-success bg-success-light px-2.5 py-0.5 rounded-full uppercase tracking-wider">Easy</span>
              <span className="text-[13px] text-text-secondary font-semibold">Arrays & Hashing</span>
            </div>

            <h1 className="text-[22px] font-extrabold text-text-primary mb-4 tracking-[-0.4px]">
              Two Sum
            </h1>

            <p className="text-[13.5px] text-text-secondary leading-relaxed mb-5 font-medium">
              Given an array of integers <code className="text-[12.5px] bg-[#F3F4F6] dark:bg-[#27272A] px-1.5 py-0.5 rounded font-mono text-text-primary">nums</code> and an integer <code className="text-[12.5px] bg-[#F3F4F6] dark:bg-[#27272A] px-1.5 py-0.5 rounded font-mono text-text-primary">target</code>, return indices of the two numbers such that they add up to target.
            </p>

            <div className="mb-5">
              <h3 className="text-[13.5px] font-bold text-text-primary mb-2">Example 1</h3>
              <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-border rounded-[10px] p-3.5 font-mono text-[12.5px] text-text-secondary leading-relaxed">
                <div className="font-bold text-text-primary">Input: <span className="font-normal text-text-secondary">nums = [2,7,11,15], target = 9</span></div>
                <div className="font-bold text-text-primary mt-1">Output: <span className="font-normal text-text-secondary">[0,1]</span></div>
                <div className="text-[11.5px] text-neutral-400 dark:text-neutral-500 mt-2">Explanation: nums[0] + nums[1] = 2 + 7 = 9</div>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="text-[13.5px] font-bold text-text-primary mb-2">Constraints</h3>
              <ul className="space-y-1.5 text-[12.5px] text-text-secondary list-disc list-inside font-mono">
                <li>2 &le; nums.length &le; 10<sup>4</sup></li>
                <li>-10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></li>
                <li>Only one valid answer exists.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col bg-[#121212]">
          <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between bg-[#181818]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#2D2D2D] text-[#CCC] text-[12.5px] rounded-[6px] px-2.5 py-1 border-0 focus:outline-none cursor-pointer"
            >
              <option>TypeScript</option>
              <option>JavaScript</option>
              <option>Python</option>
              <option>Java</option>
              <option>Go</option>
            </select>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 rounded-full bg-[#2D2D2D] text-[#CCC] text-[12.5px] font-bold hover:bg-[#3D3D3D] transition-colors cursor-pointer">
                Run
              </button>
              <button className="px-4 py-1.5 rounded-full bg-success text-white text-[12.5px] font-bold hover:bg-[#15803D] transition-colors cursor-pointer">
                Submit
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#121212]">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[#121212] text-[#D4D4D4] font-mono text-[13px] leading-relaxed p-5 resize-none focus:outline-none focus:ring-0"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right - Test Results */}
        <div className="w-[340px] border-l border-border bg-surface overflow-auto transition-colors duration-200">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">TEST RESULTS</h2>
          </div>

          <div className="p-4">
            {failed > 0 && (
              <div className="mb-4 px-4 py-3 rounded-[10px] bg-error-light border border-error/20 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 8l3 3 5-6"/>
                </svg>
                <span className="text-[13px] font-semibold text-error">
                  {passed}/{testCases.length} tests passed
                </span>
              </div>
            )}

            <div className="space-y-2">
              {testCases.map((tc) => (
                <div key={tc.id} className="rounded-[10px] border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-bold text-text-primary">Case {tc.id}</span>
                    {tc.passed === true && (
                      <span className="text-[12px] font-bold text-success">Passed</span>
                    )}
                    {tc.passed === false && (
                      <span className="text-[12px] font-bold text-error">Failed</span>
                    )}
                    {tc.passed === null && (
                      <span className="text-[12px] font-bold text-text-secondary">Pending</span>
                    )}
                  </div>
                  <div className="text-[12px] font-mono text-text-secondary space-y-0.5">
                    <div>Input: {tc.input}</div>
                    <div>Expected: {tc.expected}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
