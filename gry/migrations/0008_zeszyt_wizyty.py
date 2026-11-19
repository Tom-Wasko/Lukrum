from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gry", "0007_refleksje_druzyn"),
    ]

    operations = [
        migrations.AddField(
            model_name="runda",
            name="zeszyt",
            field=models.JSONField(default=dict),
        ),
    ]
