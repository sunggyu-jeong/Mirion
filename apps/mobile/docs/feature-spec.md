# LockFi 모바일 앱 기능 명세서

> **버전**: 1.0.0 | **네트워크**: Base Mainnet | **작성일**: 2026-03-25

---

## 1. 서비스 개요

LockFi는 사용자가 ETH를 스마트 컨트랙트에 일정 기간 잠그고, 그 기간 동안 Lido 기반 이자 수익을 얻는 강제 저축 앱이다. 예치 시 가스비를 앱이 대납하며(Gasless Deposit), 만기 후 원금 + 이자를 정산 수령할 수 있다.

---

## 2. 화면 목록 및 네비게이션 구조

```
Splash
  ├─ 저장된 지갑 세션 없음 → Onboarding (2초 후)
  └─ 저장된 지갑 세션 있음 → Main (즉시)

Onboarding
  └─ "내 지갑 연결하고 시작하기" → Main

Main (BottomTab)
  ├─ Home
  ├─ History
  └─ Settings

Home
  ├─ "ETH 예치하기" → DepositSetup (slide_from_bottom)
  └─ "정산하기" → SettlementReceipt (transparentModal)

DepositSetup
  └─ "확인" → DepositConfirm (slide_from_right)

DepositConfirm
  └─ "지갑 잠그기" → TransactionProgress (slide_from_right, gestureEnabled: false)

TransactionProgress
  ├─ 성공 → DepositSuccess (fade, gestureEnabled: false)
  └─ 실패 → Error (fade)

DepositSuccess
  └─ "홈으로 돌아가기" → Main (reset)

SettlementReceipt
  ├─ 성공 → Main (reset)
  └─ 배경 터치 → goBack

Error
  ├─ "다시 시도" → goBack
  └─ "돌아가기" → Main (reset)
```

---

## 3. 화면별 기능 명세

---

### 3.1 Splash (스플래시)

**목적**: 앱 진입 시 저장된 세션 확인 후 분기

| 항목 | 내용 |
|------|------|
| 배경색 | `#2b7fff` |
| 로고 | "LockFi" 텍스트 44px Bold White |

**로직**
1. `secureKey`에서 WalletConnect 또는 Coinbase 세션 키 조회
2. 세션 있음: `address` 복원 → `useWalletStore.setSession()` → `toMain()`
3. 세션 없음: 2,000ms 후 `toOnboarding()`

---

### 3.2 Onboarding (온보딩)

**목적**: 최초 진입 사용자에게 앱 소개 및 시작 유도

| 항목 | 내용 |
|------|------|
| 헤드라인 | "강제 저축으로 자산관리 챙기는 가장 스마트한 방법" |
| 서브텍스트 | "지금 손대는 이더리움, 확실하게 잠궈드려요" |
| CTA 버튼 | "내 지갑 연결하고 시작하기" → `toMain()` |

---

### 3.3 Home (홈)

**목적**: 사용자의 현재 예치 현황 확인 및 주요 액션 진입

#### 상태 분류

| 상태 | 조건 | 표시 내용 |
|------|------|-----------|
| 잔액 없음 | `balance == 0` | "예치된 금액이 없습니다" + "ETH 예치하기" 버튼 |
| 잠금 중 | `balance > 0 && now < unlockTime` | 예치금액 + 카운트다운 타이머 + 만기일 |
| 만기 도래 | `balance > 0 && now >= unlockTime` | 예치금액 + "정산하기" 버튼 |

#### 예치 금액 카드

| 항목 | 내용 |
|------|------|
| 예치 금액 | `formatEther(balance)` ETH |
| 이자 수익 | `formatEther(pendingReward)` (소수점 4자리) |
| 가스비 경고 | `pendingReward < 0.0005 ETH` 이면 빨간색으로 "이자 수익이 가스비보다 적습니다" 표시 |
| 카운트다운 | `DD일 HH:MM:SS` 형식, 1초마다 갱신, 초 변경 시 opacity blink 애니메이션 |
| 만기일 | `YYYY년 M월 D일` 형식 |

#### ETH 시세 카드

| 항목 | 내용 |
|------|------|
| 시세 | Mock 데이터 (`₩4,595,313`) |
| 등락 | Mock 데이터 (`▲ +2.4%`) |
| 차트 | 플레이스홀더 (추후 구현) |

#### 데이터 페칭

- `useLockInfo(address)`: 마운트 시 호출, 15초 간격 자동 갱신, staleTime 10초
- 컨트랙트 조회: `getLockInfo(address)` → `(balance, unlockTime)`, `pendingReward(address)` → `bigint`

---

### 3.4 History (내역)

**목적**: 날짜별 이자 수익 내역 조회

| 항목 | 내용 |
|------|------|
| 데이터 출처 | `GET /api/interest/:address` |
| 갱신 주기 | staleTime 60초 |
| 빈 상태 | "아직 이자 내역이 없습니다" |

#### InterestSnapshot 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| `date` | string | 날짜 |
| `daily_interest` | string | 당일 이자 (ETH) |
| `cumulative_interest` | string | 누적 이자 (ETH) |

---

### 3.5 Settings (설정)

**목적**: 연결된 지갑 정보 및 앱 정보 확인

| 섹션 | 항목 | 값 |
|------|------|-----|
| 지갑 정보 | 연결된 주소 | `useWalletStore.address` (전체 주소 표시) |
| 정보 | 버전 | 1.0.0 |
| 정보 | 네트워크 | Base Mainnet |

---

### 3.6 DepositSetup (예치 설정)

**목적**: 예치 금액과 잠금 기간 입력

| 항목 | 내용 |
|------|------|
| 금액 입력 | decimal-pad 키보드, placeholder "0.0", 단위 ETH |
| 기간 선택 | 프리셋 (7일 / 15일 / 30일 / 90일) + 직접 입력 |
| 기본 기간 | 15일 |
| 만기일 표시 | `오늘 + N일` → `YYYY.MM.DD` 형식 |
| 확인 버튼 | `amountEth > 0` 이면 primary, 아니면 secondary(비활성) |

**전달 파라미터 → DepositConfirm**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `amountEth` | string | 입력된 ETH 금액 |
| `unlockDate` | string | ISO 8601 형식 만기일 |

---

### 3.7 DepositConfirm (예치 확인)

**목적**: 예치 조건 최종 확인 및 면책 동의

#### 표시 정보

| 항목 | 표시값 |
|------|--------|
| 잠금 금액 | `amountEth ETH` |
| 잠긴 일시 | `YYYY.MM.DD` (unlockDate 파싱) |

#### 면책 고지 (DisclaimerBox)

> **원금 차감 가능성 안내**
> 가스비 대납 혜택을 드리고 있으나 **부족한 만큼 원금에서 정산**됩니다.

- 동의 체크박스: "위 위험 요소를 확인했으며, 동의 합니다."
- 체크 전: "지갑 잠그기" 버튼 secondary(비활성)
- 체크 후: "지갑 잠그기" 버튼 primary → `toTransactionProgress`

**전달 파라미터 → TransactionProgress**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `amountEth` | string | ETH 금액 |
| `unlockTimestamp` | string | Unix timestamp (초, BigInt → string 변환) |
| `unlockDateLabel` | string | `YYYY년 M월 D일` 형식 표시용 |

---

### 3.8 TransactionProgress (트랜잭션 진행)

**목적**: 가스리스 예치 트랜잭션 진행 상황 실시간 표시

#### 단계 표시 (StepIndicator)

| Step | txState | 라벨 | 서브타이틀 |
|------|---------|------|-----------|
| 1 | `biometric` | 트랜잭션 승인 | 지갑에서 트랜잭션을 승인해주세요 |
| 2 | `broadcasting` / `pending` | 예치 진행 중 | 블록체인에 기록 중입니다 |
| 3 | `success` | 확인 대기 | 트랜잭션이 확인되고 있습니다 |

#### 가스리스 예치 흐름 (useGaslessDeposit)

```
1. 생체 인증 (Face ID / Touch ID)
2. secureKey에서 개인키 복호화
3. deposit(unlockTime) calldata 생성 + 서명
4. POST /api/relay → 백엔드가 가스비 대납 후 txHash 반환
5. MMKV에 pendingTx 저장 (앱 종료 대비)
6. 낙관적 업데이트: useLockStore.optimisticDeposit()
7. publicClient.waitForTransactionReceipt() 대기 (폴링 6초, 최대 10회)
8. 완료: clearPendingTx() + QueryClient invalidate
```

#### 상태 전환

```
idle → biometric → broadcasting → pending → success
                                           → error
```

| 상태 | 동작 |
|------|------|
| `success` | `toDepositSuccess({ unlockDateLabel })` |
| `error` | `toError({ errorType: 'transaction' })` |
| `error` + X버튼 | `goBack()` |

**제약**: `gestureEnabled: false` (스와이프 뒤로가기 차단)

---

### 3.9 DepositSuccess (예치 완료)

**목적**: 예치 성공 축하 화면

| 항목 | 내용 |
|------|------|
| 아이콘 | 체크 아이콘 (scale + opacity 스프링 애니메이션) |
| 메시지 | "예치가 완료되었습니다!" |
| 만기일 | "만기일 : YYYY년 M월 D일" |
| 버튼 | "홈으로 돌아가기" → `toMain()` (reset) |

**제약**: `gestureEnabled: false`

---

### 3.10 SettlementReceipt (정산 영수증)

**목적**: 만기 도래 시 정산 내역 확인 및 출금 실행

#### 애니메이션 순서

1. 딤드 배경: `opacity 0 → 1` (250ms, withTiming)
2. 바텀시트 카드: 200ms 딜레이 후 `translateY 600 → 0` (withSpring, damping 22)

#### 정산 계산식

| 항목 | 계산 |
|------|------|
| 예치 원금 | `formatEther(balance)` |
| 누적 이자 | `formatEther(pendingReward)` |
| 가스비 | 고정 `0.0005 ETH` |
| 수수료 | `이자 × 3%` |
| **최종 수령액** | `원금 + 이자 - 가스비 - 수수료` (최소 0) |

#### 출금 흐름 (useWithdraw → useBiometricTransaction)

```
1. 생체 인증 (Face ID / Touch ID)
2. walletClient.writeContract({ functionName: 'withdraw' })
3. MMKV에 pendingTx 저장
4. 낙관적 업데이트: useLockStore.optimisticWithdraw()
5. 영수증 확인 대기
```

| 상태 | 동작 |
|------|------|
| `biometric / broadcasting / pending` | ActivityIndicator 표시 (버튼 숨김) |
| `success` | `toMain()` (reset) |
| 배경 터치 | `goBack()` |

---

### 3.11 Error (오류)

**목적**: 오류 유형별 안내 및 복구 액션 제공

| errorType | 아이콘 | 타이틀 | 설명 |
|-----------|--------|--------|------|
| `network` | WifiOff | 네트워크 연결 오류 | 인터넷 연결을 확인해주세요 / 네트워크가 불안정합니다 |
| `transaction` | Info | 트랜잭션 실패 | 트랜잭션을 처리하던 중 오류가 발생했습니다 / 지갑 잔액과 가스비를 확인해주세요 |
| `balance` | Wallet | 잔액이 부족합니다 | 예치하는 금액보다 지갑 잔액이 부족합니다 / 금액을 조정하거나 지갑에 ETH를 충전해주세요 |

| 버튼 | 동작 |
|------|------|
| "다시 시도" (primary) | `goBack()` |
| "돌아가기" (secondary) | `toMain()` (reset) |

---

## 4. 컨트랙트 에러 코드 매핑

| 컨트랙트 에러 | 사용자 메시지 |
|--------------|--------------|
| `TimeLock__ZeroAmount` | 예치 금액은 0보다 커야 합니다. |
| `TimeLock__InvalidUnlockTime` | 잠금 해제 시간이 올바르지 않습니다. |
| `TimeLock__CannotShortenDuration` | 잠금 기간을 단축할 수 없습니다. |
| `TimeLock__Locked` | 아직 잠금 해제 시간이 되지 않았습니다. |
| `TimeLock__NoBalance` | 예치된 잔액이 없습니다. |
| `TimeLock__NoReward` | 수령할 이자가 없습니다. |
| `TimeLock__InsufficientReserve` | 컨트랙트 예비금이 부족합니다. |
| `TimeLock__TransferFailed` | 전송에 실패했습니다. |

---

## 5. 상태 관리

### useLockStore (Zustand)

| 상태 | 타입 | 설명 |
|------|------|------|
| `balance` | `bigint` | 예치 잔액 (wei) |
| `unlockTime` | `bigint` | 만기 Unix timestamp (초) |
| `pendingReward` | `bigint` | 미수령 이자 (wei) |

| 액션 | 설명 |
|------|------|
| `setLockInfo` | 컨트랙트 조회 결과 저장 |
| `setPendingReward` | 이자 업데이트 |
| `optimisticDeposit` | 예치 즉시 balance/unlockTime 반영 |
| `optimisticWithdraw` | 출금 즉시 balance/unlockTime 초기화 |

### useWalletStore (Zustand)

| 상태 | 타입 | 설명 |
|------|------|------|
| `address` | `string \| null` | 연결된 지갑 주소 |
| `walletType` | `'walletconnect' \| 'coinbase' \| null` | 지갑 유형 |

---

## 6. txState 전환 다이어그램

```
idle
 │
 ▼ (예치/출금 시작)
biometric       ← 생체 인증 대기
 │
 ├─ 인증 실패 → idle
 │
 ▼
broadcasting    ← 릴레이 서버 or 컨트랙트 호출 중
 │
 ▼
pending         ← 트랜잭션 전파 완료, 컨펌 대기
 │
 ├─ success → 화면 전환
 └─ error   → Error 화면 or 에러 상태 표시
```

---

## 7. 보안 및 키 관리

| 항목 | 내용 |
|------|------|
| 키 저장 | `react-native-biometrics` + iOS Keychain / Android Keystore |
| 세션 키 | `WC_SESSION_KEY`, `CB_SESSION_KEY` (지갑 유형별 분리) |
| 서명 방식 | 가스리스 예치: 개인키로 calldata 서명 → 백엔드 릴레이 |
| 출금 방식 | 직접 컨트랙트 호출 (walletClient.writeContract) |
| 개인키 처리 | 사용 후 즉시 `null` 초기화 (`finally` 블록 보장) |

---

## 8. 백엔드 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/relay` | POST | 가스비 대납 트랜잭션 릴레이 |
| `/api/interest/:address` | GET | 이자 내역 조회 |

### POST /api/relay 요청 바디

| 필드 | 타입 | 설명 |
|------|------|------|
| `userAddress` | string | 사용자 지갑 주소 |
| `fnName` | string | 컨트랙트 함수명 (`deposit`) |
| `calldata` | string | 인코딩된 calldata |
| `signedHash` | string | 사용자 서명값 |
| `value` | string | 예치 금액 (wei, string) |
| `maxFeePerGas` | string? | 추정 가스비 × 110% |

### POST /api/relay 응답

| 필드 | 타입 | 설명 |
|------|------|------|
| `txHash` | string | 트랜잭션 해시 |

---

## 9. 미구현 / 향후 과제

| 항목 | 상태 |
|------|------|
| 실시간 ETH 시세 연동 | Mock 데이터 사용 중 |
| ETH 시세 차트 | 플레이스홀더 |
| WalletConnect / Coinbase 실제 지갑 연결 | 온보딩에서 바이패스 중 |
| HistoryScreen 날짜별 그룹핑 UI | 기본 목록만 구현 |
| 에러 화면 `balance` 타입 진입 경로 | DepositConfirm에서 미연결 |
