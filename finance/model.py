"""مدل مالی ۱۲ ماهه — همه‌ی ورودی‌ها فرض هستند (نه داده‌ی واقعی). اجرا: python3 finance/model.py
قبل از هر تصمیم مالی، ورودی‌ها را با داده‌ی واقعی Search Console / پردازشگر پرداخت جایگزین کنید."""
from dataclasses import dataclass

@dataclass
class Scenario:
    name: str
    visits_m12: int        # بازدید ماهانه‌ی ارگانیک در ماه ۱۲ (رشد خطی از ۰ تا این مقدار)
    email_rate: float      # نرخ ثبت‌نام/خبرنامه از بازدید
    buy_rate: float        # نرخ خرید تکی/باندل از بازدید
    sub_rate: float        # نرخ اشتراک جدید ماهانه از کاربران ثبت‌نام‌شده
    churn: float           # ریزش ماهانه‌ی اشتراک
    lifetime_per_month: int  # فروش مادام‌العمر در ماه (پس از ماه ۳)
    sponsor_per_month: float = 0.0  # اسپانسری/خبرنامه از ماه ۶ ($)

# قیمت‌ها (دلار) — بازار EN/AR ؛ فارسی جدا (بخش پایین)
ARPU_ORDER = 19.0        # میانگین سفارش تکی/باندل (ترکیب ۶.۹۹ تکی و ۴۹ باندل)
PLUS_ANNUAL_SHARE = 0.4  # سهم سالانه‌ها از اشتراک‌ها
PLUS_M, PLUS_Y = 12.0, 99.0
LIFETIME = 149.0
TEAM_SHARE, TEAM_PRICE = 0.08, 39.0   # سهم تیمی از مشترکان
FEE_PCT, FEE_FIX = 0.05, 0.50          # MoR (Paddle/Lemon Squeezy) ⚠️ تأیید شود
FIXED_COST = 320.0       # هاست+دیتابیس+ابزار+دامنه+ایمیل (ماهانه) 🧭
LLM_COST_PER_PROMPT = 0.35  # تولید+تست چندمدلی+ترجمه 🧭
NEW_PROMPTS_PER_MONTH = 120

# --- جریان‌های نسخه ۲: تبلیغات، افیلیت، محصولات عمودی (docs/11, docs/12) — همه فرض 🧭 ---
MIX = {"en": 0.45, "ar": 0.30, "fa": 0.25}           # سهم ترافیک به تفکیک زبان
RPM = {"en": 6.0, "ar": 1.5, "fa": 0.8}              # $ به‌ازای ۱۰۰۰ نمایش صفحه ⚠️ (منابع متناقض؛ با داده‌ی واقعی جایگزین شود)
EPM_AFF = {"en": 8.0, "ar": 3.0, "fa": 0.0}          # افیلیت $ به‌ازای ۱۰۰۰ بازدید ⚠️
PV_PER_VISIT = 2.4
ADS_START_MONTH = 3
ADFREE_PLUS = True                                   # مشترک Plus بدون تبلیغ
VERTICAL_RATE, VERTICAL_ARPU = 0.002, 45.0           # فروش عمودی‌ها (3D/AI Elements/Skills) به‌ازای بازدید

SCENARIOS = [
    Scenario("محافظه‌کار", 8000, 0.03, 0.004, 0.010, 0.07, 3, 0),
    Scenario("پایه",        30000, 0.035, 0.007, 0.015, 0.05, 8, 300),
    Scenario("خوش‌بینانه",  90000, 0.04, 0.010, 0.020, 0.04, 20, 1000),
]

def run(s: Scenario):
    subs, rows, cum = 0.0, [], 0.0
    for m in range(1, 13):
        visits = s.visits_m12 * max(0, m - 2) / 10  # تأخیر سئو: ۲ ماه اول ترافیک ناچیز
        regs = visits * s.email_rate
        orders = visits * s.buy_rate
        subs = subs * (1 - s.churn) + regs * s.sub_rate
        mrr_unit = (1 - PLUS_ANNUAL_SHARE) * PLUS_M + PLUS_ANNUAL_SHARE * PLUS_Y / 12
        plus_rev = subs * (1 - TEAM_SHARE) * mrr_unit + subs * TEAM_SHARE * TEAM_PRICE
        life = s.lifetime_per_month if m > 3 else 0
        vert = visits * VERTICAL_RATE
        ads = sum(visits * MIX[k] * PV_PER_VISIT / 1000 * RPM[k] for k in MIX) if m >= ADS_START_MONTH else 0.0
        aff = sum(visits * MIX[k] / 1000 * EPM_AFF[k] for k in MIX)
        sponsor = s.sponsor_per_month if m >= 6 else 0.0
        gross = orders * ARPU_ORDER + vert * VERTICAL_ARPU + plus_rev + life * LIFETIME + ads + aff + sponsor
        txns = orders + vert + subs + life
        sales = gross - ads - aff - sponsor           # کارمزد پردازشگر فقط روی فروش
        fees = sales * FEE_PCT + txns * FEE_FIX
        cost = FIXED_COST + NEW_PROMPTS_PER_MONTH * LLM_COST_PER_PROMPT + fees
        net = gross - cost
        cum += net
        rows.append((m, round(visits), round(subs), round(gross), round(net), round(cum), round(ads + aff + sponsor)))
    return rows

if __name__ == "__main__":
    for s in SCENARIOS:
        r = run(s)
        print(f"\n## {s.name}  (بازدید ماه ۱۲ = {s.visits_m12:,})")
        print("ماه | بازدید | مشترک | درآمد ناخالص$ | سود خالص$ | سود تجمعی$ | سهم تبلیغ+افیلیت+اسپانسر$")
        for row in r:
            if row[0] in (1, 3, 6, 9, 12):
                print(" | ".join(str(x) for x in row))
        be = next((x[0] for x in r if x[4] > 0), None)
        print("اولین ماه سودده:", be)
