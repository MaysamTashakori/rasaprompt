"""مدل مالی بازار ایران (میلیون تومان). همه‌ی ورودی‌ها فرض 🧭 هستند و باید با داده‌ی واقعی جایگزین شوند.
اجرا: python3 finance/model_ir.py   — خروجی بدون تبدیل به دلار (نرخ ارز نوسانی است)."""
from dataclasses import dataclass

@dataclass
class S:
    name: str
    visits_m12: int      # بازدید ماهانه در ماه ۱۲ (اینستاگرام/تلگرام/سئو)
    buy: float           # نرخ خرید تکی/باندل از بازدید
    sub: float           # اشتراک جدید از بازدید (ماهانه)
    churn: float
    sponsor: float       # اسپانسری/ماه از ماه ۴ (م.ت)

ARPU_ORDER = 0.30        # م.ت میانگین سفارش (رقبا ~۰٫۱۷–۰٫۲۲ م.ت به‌ازای محصول ⚠️ فاز ۱)
SUB_ARPU = 0.25          # م.ت/ماه معادل اشتراک (۳ ماهه/سالانه به ماه تبدیل)
PV, RPM = 2.2, 0.025     # صفحه/بازدید ؛ م.ت به‌ازای ۱۰۰۰ نمایش صفحه ⚠️ نامعلوم — از شبکه‌های ایرانی بگیرید
VERT_RATE, VERT_ARPU = 0.0005, 1.8   # عمودی‌ها (3D/المان/Skill) م.ت
GATEWAY = 0.02           # کارمزد درگاه ⚠️ تأیید شود
FIXED = 8.0              # هاست ایران، SMS، ابزار، دامنه (م.ت/ماه)
TEST_COST = 4.0          # هزینه‌ی تست/تولید مدل (م.ت/ماه) — به مدل در دسترس بستگی دارد
SC = [S("محافظه‌کار", 40_000, 0.003, 0.0015, 0.12, 0), S("پایه", 150_000, 0.006, 0.003, 0.10, 8), S("خوش‌بینانه", 400_000, 0.009, 0.005, 0.08, 20)]

def run(s: S):
    subs, cum, rows = 0.0, 0.0, []
    for m in range(1, 13):
        v = s.visits_m12 * max(0, m - 1) / 11          # ترافیک اجتماعی سریع‌تر از سئو
        subs = subs * (1 - s.churn) + v * s.sub
        sales = v * s.buy * ARPU_ORDER + v * VERT_RATE * VERT_ARPU + subs * SUB_ARPU
        ads = v * PV / 1000 * RPM if m >= 2 else 0.0
        spons = s.sponsor if m >= 4 else 0.0
        gross = sales + ads + spons
        net = gross - sales * GATEWAY - FIXED - TEST_COST
        cum += net
        rows.append((m, round(v), round(subs), round(sales, 1), round(ads + spons, 1), round(net, 1), round(cum, 1)))
    return rows

if __name__ == "__main__":
    for s in SC:
        print(f"\n## {s.name} (بازدید ماه ۱۲ = {s.visits_m12:,}) — ارقام: میلیون تومان")
        print("ماه | بازدید | مشترک | فروش | تبلیغ+اسپانسر | سود خالص | تجمعی")
        for r in run(s):
            if r[0] in (1, 3, 6, 9, 12): print(" | ".join(map(str, r)))
