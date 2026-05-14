http://localhost:9000
admin:SuperSecretPassword123!
squ_d990371a2448e79beaee853f0a0143c190dd2c01

source /opt/miniconda3/bin/activate b2r
cd backend
PYTHONPATH=. pytest --cov=app/core --cov-report=xml:coverage.xml tests/

export PATH="/opt/sonar-scanner/bin:$PATH"
sonar-scanner -Dsonar.token=squ_d990371a2448e79beaee853f0a0143c190dd2c01